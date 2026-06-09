"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canDoTask, isLead, type TaskAction } from "@/lib/tasks-machine";
import { nextTaskCode } from "@/lib/task-code";
import { emitKpiEvent } from "@/lib/kpi-engine";
import type { TaskStatus } from "@/lib/types/entities";
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

const TaskTransitionInput = z.object({
  taskId: z.string().min(1),
  action: z.enum([
    "assign",
    "start",
    "submit",
    "complete",
    "approve",
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
  complete: "task.approve",
  approve: "task.approve",
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
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) return { ok: false, error: "not_found" };

  const guard = canDoTask(
    action,
    task.status as TaskStatus,
    { role, isAssignee: task.assigneeId === userId },
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
  if (!["chief", "lead", "head", "super"].includes(role)) return { ok: false, error: "forbidden" };

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { audit: { select: { members: true } } },
  });
  if (!task) return { ok: false, error: "not_found" };
  const memberIds = task.audit.members.map((m) => m.userId);
  if (!memberIds.includes(assigneeId)) return { ok: false, error: "not_member" };
  if (assigneeId === task.assigneeId) return { ok: true };

  await prisma.$transaction([
    prisma.task.update({ where: { id: taskId }, data: { assigneeId } }),
    prisma.auditLog.create({
      data: {
        userId,
        action: "task.assign",
        entity: taskId,
        level: "info",
        payload: J({ from: task.assigneeId, to: assigneeId }),
      },
    }),
  ]);

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/tasks");
  return { ok: true };
}

// Statuses where the group lead assigns/creates tasks (during fieldwork).
const TASK_CREATE_STATUSES = ["assigning", "in_progress"];

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

  // Role-gated: the group lead creates + assigns. (LEAD_ROLES — no duty column yet.)
  const { userId, role } = await requireSession();
  if (!isLead(role)) return { ok: false, error: "forbidden" };

  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    select: { status: true, members: { select: { userId: true } } },
  });
  if (!audit) return { ok: false, error: "not_found" };
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
      await recountTasksAgg(tx, auditId);
      await emitKpiEvent(tx, {
        userId,
        ruleCode: "assign_tasks_correctly",
        points: 10,
        auditId,
      });
    });
  } catch {
    return { ok: false, error: "code_conflict" };
  }

  revalidatePath("/tasks/assign");
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/kpi");
  revalidatePath(`/audits/${auditId}`);
  return { ok: true, id };
}
