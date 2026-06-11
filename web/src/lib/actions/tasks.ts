"use server";

import { revalidatePath } from "next/cache";
import { createHash } from "crypto";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { canDoTask, type TaskAction } from "@/lib/tasks-machine";
import { nextTaskCode } from "@/lib/task-code";
import { emitKpiEvent } from "@/lib/kpi-engine";
import { emitNotification } from "@/lib/notifications/emit";
import type { TaskStatus } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";
import type { ActionResult, CreateResult } from "./types";

// Plain-JSON clone (typed any) for Prisma Json columns.
const J = (v: unknown) => JSON.parse(JSON.stringify(v));

// Recompute the denormalized Audit.tasksAgg from the audit's task rows, in-transaction.
// Shared by taskTransition + createTask. (`assigned` lands only in `total`, by design.)
async function recountTasksAgg(tx: Prisma.TransactionClient, auditId: string) {
  const rows = await tx.task.findMany({ where: { auditId }, select: { status: true } });
  const agg = { total: rows.length, done: 0, in_progress: 0, blocked: 0, new: 0 };
  for (const r of rows) {
    if (r.status === "done") agg.done++;
    else if (r.status === "in_progress") agg.in_progress++;
    else if (r.status === "blocked") agg.blocked++;
    else if (r.status === "new") agg.new++;
  }
  await tx.audit.update({ where: { id: auditId }, data: { tasksAgg: J(agg) } });
}

function canCreateTaskForAudit(userId: string, role: RoleCode, leaderId: string): boolean {
  return userId === leaderId || role === "super" || role === "head";
}

const TaskTransitionInput = z.object({
  taskId: z.string().min(1),
  action: z.enum([
    "assign",
    "start",
    "approve",
    "approve_head",
    "return",
    "restart",
    "unblock",
  ]),
  comment: z.string().optional(),
});

const AUDIT_ACTION: Record<TaskAction, string> = {
  assign: "task.assign",
  start: "task.update_status",
  submit: "task.update_status",
  approve: "task.approve",
  approve_head: "task.approve",
  return: "task.return",
  restart: "task.update_status",
  unblock: "task.update_status",
};

export async function taskTransition(
  input: z.input<typeof TaskTransitionInput>,
): Promise<ActionResult> {
  const parsed = TaskTransitionInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { taskId, action, comment } = parsed.data;

  const { userId, role } = await requireSession();
  const requiredPermission = action === "assign" ? "task.assign" : "task.update_status";
  if (!(await requirePermission(userId, requiredPermission))) return { ok: false, error: "forbidden" };
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { audit: { select: { leaderId: true } } },
  });
  if (!task) return { ok: false, error: "not_found" };

  const guard = canDoTask(
    action,
    task.status as TaskStatus,
    {
      role,
      isAssignee: task.assigneeId === userId,
      isAuditLeader: task.audit.leaderId === userId,
      isSuper: role === "super",
    },
    comment,
  );
  if (!guard.ok) return { ok: false, error: guard.reason };
  const to = guard.to as TaskStatus;

  await prisma.$transaction(async (tx) => {
    await tx.task.update({ where: { id: taskId }, data: { status: to } });
    await tx.taskStatusHistory.create({
      data: {
        taskId,
        fromStatus: task.status,
        toStatus: to,
        changedBy: userId,
        comment: comment ?? null,
      },
    });
    await tx.auditLog.create({
      data: {
        userId,
        action: AUDIT_ACTION[action],
        entity: taskId,
        level: action === "return" ? "warn" : "info",
        payload: J({ from: task.status, to, comment: comment ?? null }),
      },
    });
    if (action === "return") {
      await emitNotification(tx, {
        type: "task_returned",
        recipients: [task.assigneeId].filter(Boolean) as string[],
        actorId: userId,
        params: { title: task.title },
        href: `/tasks/${task.id}`,
        auditId: task.auditId,
        entityType: "task",
        entityId: task.id,
      });
    }
    await recountTasksAgg(tx, task.auditId);
    if (to === "done") {
      const today = new Date().toISOString().slice(0, 10);
      await emitKpiEvent(tx, {
        userId: task.assigneeId,
        ruleCode: "task_completed",
        points: 5,
        auditId: task.auditId,
        countField: "tasks",
      });
      if (task.due >= today) {
        await emitKpiEvent(tx, {
          userId: task.assigneeId,
          ruleCode: "task_on_time",
          points: 5,
          auditId: task.auditId,
        });
      } else {
        await emitKpiEvent(tx, {
          userId: task.assigneeId,
          ruleCode: "task_overdue",
          points: -5,
          auditId: task.auditId,
        });
      }
    }
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/kpi");
  revalidatePath(`/audits/${task.auditId}`);
  return { ok: true };
}

const ReassignInput = z.object({ taskId: z.string().min(1), assigneeId: z.string().min(1) });

export async function reassignTask(input: z.input<typeof ReassignInput>): Promise<ActionResult> {
  const parsed = ReassignInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { taskId, assigneeId } = parsed.data;

  const { userId, role } = await requireSession();
  if (!(await requirePermission(userId, "task.assign"))) return { ok: false, error: "forbidden" };

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { audit: { select: { leaderId: true, members: { select: { userId: true } } } } },
  });
  if (!task) return { ok: false, error: "not_found" };
  // Only the audit's own leader or super may reassign tasks in that audit.
  if (role !== "super" && task.audit.leaderId !== userId) return { ok: false, error: "forbidden" };
  const memberIds = task.audit.members.map((m) => m.userId);
  if (!memberIds.includes(assigneeId)) return { ok: false, error: "not_member" };
  if (assigneeId === task.assigneeId) return { ok: true };

  await prisma.$transaction(async (tx) => {
    await tx.task.update({ where: { id: taskId }, data: { assigneeId } });
    await tx.auditLog.create({
      data: {
        userId,
        action: "task.assign",
        entity: taskId,
        level: "info",
        payload: J({ from: task.assigneeId, to: assigneeId }),
      },
    });
    await emitNotification(tx, {
      type: "task_reassigned",
      recipients: [assigneeId].filter(Boolean) as string[],
      actorId: userId,
      params: { title: task.title },
      href: `/tasks/${task.id}`,
      auditId: task.auditId,
      entityType: "task",
      entityId: task.id,
    });
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
  return { ok: true };
}

// Statuses where the group lead assigns/creates tasks (during fieldwork).
const TASK_CREATE_STATUSES = ["approved", "assigning", "in_progress"];

const CreateTaskInput = z.object({
  auditId: z.string().min(1),
  title: z.string().min(3),
  type: z.string().min(1),
  priority: z.string().min(1),
  due: z.string().min(4),
  assigneeId: z.string().min(1),
});

export async function createTask(input: z.input<typeof CreateTaskInput>): Promise<CreateResult> {
  const parsed = CreateTaskInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { auditId, title, type, priority, due, assigneeId } = parsed.data;

  const { userId, role } = await requireSession();
  if (!(await requirePermission(userId, "task.assign"))) return { ok: false, error: "forbidden" };

  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    select: { status: true, leaderId: true, members: { select: { userId: true } } },
  });
  if (!audit) return { ok: false, error: "not_found" };
  if (!canCreateTaskForAudit(userId, role, audit.leaderId)) {
    return { ok: false, error: "forbidden" };
  }
  if (!TASK_CREATE_STATUSES.includes(audit.status)) return { ok: false, error: "illegal_status" };
  if (!audit.members.some((m) => m.userId === assigneeId))
    return { ok: false, error: "not_member" };

  const existing = await prisma.task.findMany({
    where: { id: { startsWith: "T-" } },
    select: { id: true },
  });
  const id = nextTaskCode(existing.map((t) => t.id));

  try {
    await prisma.$transaction(async (tx) => {
      await tx.task.create({
        data: {
          id,
          auditId,
          title,
          type,
          priority,
          status: "assigned",
          due,
          assigneeId,
          findings: 0,
          files: 0,
          kpi: 0,
        },
      });
      await tx.taskStatusHistory.create({
        data: {
          taskId: id,
          fromStatus: "new",
          toStatus: "assigned",
          changedBy: userId,
          comment: null,
        },
      });
      await tx.auditLog.create({
        data: {
          userId,
          action: "task.create",
          entity: id,
          level: "info",
          payload: J({ auditId, title, assigneeId }),
        },
      });
      await emitNotification(tx, {
        type: "task_assigned",
        recipients: [assigneeId].filter(Boolean) as string[],
        actorId: userId,
        params: { title },
        href: `/tasks/${id}`,
        auditId,
        entityType: "task",
        entityId: id,
      });
      await recountTasksAgg(tx, auditId);
      await emitKpiEvent(tx, {
        userId,
        ruleCode: "assign_tasks_correctly",
        points: 10,
        auditId,
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "code_conflict" };
    }
    console.error("createTask failed", error);
    return { ok: false, error: "failed" };
  }

  revalidatePath("/tasks/assign");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/kpi");
  revalidatePath(`/audits/${auditId}`);
  return { ok: true, id };
}

const EDITABLE_STATUSES = ["new", "assigned"] as const;

const UpdateTaskInput = z.object({
  taskId: z.string().min(1),
  title: z.string().min(1).max(200),
  priority: z.enum(["Yuqori", "Oʻrta", "Past"]),
  due: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export async function updateTask(input: z.input<typeof UpdateTaskInput>): Promise<ActionResult> {
  const parsed = UpdateTaskInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { taskId, title, priority, due } = parsed.data;

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "task.assign"))) return { ok: false, error: "forbidden" };

  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { status: true, auditId: true } });
  if (!task) return { ok: false, error: "not_found" };
  if (!(EDITABLE_STATUSES as readonly string[]).includes(task.status)) {
    return { ok: false, error: "illegal_status" };
  }

  await prisma.$transaction([
    prisma.task.update({ where: { id: taskId }, data: { title, priority, due } }),
    prisma.auditLog.create({
      data: {
        userId,
        action: "task.update",
        entity: taskId,
        level: "info",
        payload: J({ title, priority, due }),
      },
    }),
  ]);

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
  revalidatePath(`/audits/${task.auditId}`);
  return { ok: true };
}

const MAX_SUBMIT_FILES = 5;
const MAX_SUBMIT_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

export async function submitTaskForReview(formData: FormData): Promise<ActionResult> {
  const { userId, role } = await requireSession();

  const taskId = String(formData.get("taskId") ?? "").trim();
  const comment = String(formData.get("comment") ?? "").trim();
  const rawFiles = formData.getAll("files");
  const files = rawFiles.filter((f): f is File => f instanceof File && f.size > 0);

  if (!taskId) return { ok: false, error: "invalid" };
  if (comment.length < 10) return { ok: false, error: "comment_required" };
  if (files.length > MAX_SUBMIT_FILES) return { ok: false, error: "too_many_files" };
  for (const f of files) {
    if (f.size > MAX_SUBMIT_FILE_BYTES) return { ok: false, error: "too_large" };
  }

  if (!(await requirePermission(userId, "task.update_status"))) {
    return { ok: false, error: "forbidden" };
  }

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { audit: { select: { leaderId: true } } },
  });
  if (!task) return { ok: false, error: "not_found" };

  const guard = canDoTask(
    "submit",
    task.status as TaskStatus,
    {
      role,
      isAssignee: task.assigneeId === userId,
      isAuditLeader: task.audit.leaderId === userId,
      isSuper: role === "super",
    },
    comment,
  );
  if (!guard.ok) return { ok: false, error: guard.reason };

  await prisma.$transaction(async (tx) => {
    const fileIds: string[] = [];
    for (const f of files) {
      const buf = Buffer.from(await f.arrayBuffer());
      const sha256 = createHash("sha256").update(buf).digest("hex");
      const stored = await tx.fileStorage.create({
        data: {
          filename: f.name,
          mimeType: f.type || "application/octet-stream",
          sizeBytes: buf.length,
          sha256,
          provider: "db",
          bytes: buf,
          uploadedById: userId,
        },
      });
      fileIds.push(stored.id);
    }

    await tx.task.update({ where: { id: taskId }, data: { status: "review" } });

    const history = await tx.taskStatusHistory.create({
      data: { taskId, fromStatus: task.status, toStatus: "review", changedBy: userId, comment },
    });

    for (const fileId of fileIds) {
      await tx.taskSubmissionFile.create({ data: { historyId: history.id, fileId } });
    }

    await tx.auditLog.create({
      data: {
        userId,
        action: "task.update_status",
        entity: taskId,
        level: "info",
        payload: J({ from: task.status, to: "review", files: fileIds.length }),
      },
    });

    await emitNotification(tx, {
      type: "task_review",
      recipients: [task.audit.leaderId].filter(Boolean) as string[],
      actorId: userId,
      params: { title: task.title },
      href: `/tasks/${taskId}`,
      auditId: task.auditId,
      entityType: "task",
      entityId: taskId,
    });

    await recountTasksAgg(tx, task.auditId);
  });

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath(`/audits/${task.auditId}`);
  return { ok: true };
}
