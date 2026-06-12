import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { userHasPermission } from "@/lib/rbac.server";
import type { Audit, Task, TaskPriority, TaskStatus } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

type Row = {
  id: string;
  auditId: string;
  title: string;
  type: string;
  priority: string;
  status: string;
  due: string;
  assigneeId: string;
  findings: number;
  files: number;
  kpi: number;
};

function toTask(t: Row): Task {
  return {
    id: t.id,
    auditId: t.auditId,
    title: t.title,
    type: t.type,
    priority: t.priority as TaskPriority,
    status: t.status as TaskStatus,
    due: t.due,
    assignee: t.assigneeId,
    findings: t.findings,
    files: t.files,
    kpi: t.kpi,
  };
}

export const getTasks = cache(
  // Stable id order — deterministic across row updates (keeps the assign table snapshot stable).
  async (): Promise<Task[]> => (await prisma.task.findMany({ orderBy: { id: "asc" } })).map(toTask),
);

export const getTaskById = cache(async (id: string): Promise<Task | undefined> => {
  const t = await prisma.task.findUnique({ where: { id } });
  return t ? toTask(t) : undefined;
});

/** Returns the task only if userId has access per their role. Returns undefined → 404. */
export const getTaskByIdScoped = cache(
  async (id: string, userId: string, role: RoleCode): Promise<Task | undefined> => {
    const t = await prisma.task.findUnique({
      where: { id },
      include: { audit: { select: { leaderId: true, members: { select: { userId: true } } } } },
    });
    if (!t) return undefined;
    if (role === "super" || role === "head") return toTask(t);
    const memberIds = t.audit.members.map((m) => m.userId);
    if (role === "chief") {
      if (!memberIds.includes(userId)) return undefined;
    } else if (role === "lead") {
      if (t.audit.leaderId !== userId) return undefined;
    } else {
      // t1 — only own tasks
      if (t.assigneeId !== userId) return undefined;
    }
    return toTask(t);
  },
);

export const getTasksByAudit = cache(
  async (auditId: string): Promise<Task[]> =>
    (await prisma.task.findMany({ where: { auditId }, orderBy: { id: "asc" } })).map(toTask),
);

export const getMyTasks = cache(
  async (userId: string): Promise<Task[]> =>
    (await prisma.task.findMany({ where: { assigneeId: userId }, orderBy: { id: "asc" } })).map(
      toTask,
    ),
);

// Tasks visible on the assignment board, scoped server-side:
// super/head see every task; everyone else only tasks in audits they lead
// (mirrors getCreatableTaskAudits — "audit-group leader distributes tasks").
export const getAssignableTasks = cache(async (userId: string, role: RoleCode): Promise<Task[]> => {
  const where = role === "super" || role === "head" ? {} : { audit: { leaderId: userId } };
  return (await prisma.task.findMany({ where, orderBy: { id: "asc" } })).map(toTask);
});

export const getCreatableTaskAudits = cache(
  async (userId: string, role: RoleCode): Promise<Audit[]> => {
    if (!(await userHasPermission(userId, "task.assign"))) return [];

    const rows = await prisma.audit.findMany({
      where: {
        status: { in: ["assigning", "in_progress"] },
        ...(role === "super" || role === "head" ? {} : { leaderId: userId }),
      },
      include: { members: { select: { userId: true } } },
      orderBy: { code: "desc" },
    });
    return rows.map((a) => ({
      id: a.id,
      code: a.code,
      title: a.title,
      org: a.orgId,
      type: a.type,
      status: a.status as Audit["status"],
      stage: a.stage,
      startDate: a.startDate,
      endDate: a.endDate,
      progress: a.progress,
      leader: a.leaderId,
      members: a.members.map((m) => m.userId),
      findings: a.findings as unknown as Audit["findings"],
      tasks: a.tasksAgg as unknown as Audit["tasks"],
      lastSync: a.lastSync,
      pinned: a.pinned,
      goal: a.goal ?? undefined,
      methodology: a.methodology ?? undefined,
      scope: a.scope,
      tools: a.tools,
    }));
  },
);

export interface TaskHistoryFile {
  id: string;
  filename: string;
  sizeBytes: number;
  mimeType: string;
}

export interface TaskHistoryEntry {
  who: string;
  action: string;
  time: string;
  comment?: string;
  files?: TaskHistoryFile[];
}

export const getTaskStatusHistory = cache(async (taskId: string): Promise<TaskHistoryEntry[]> => {
  const rows = await prisma.taskStatusHistory.findMany({
    where: { taskId },
    include: {
      submissionFiles: {
        include: {
          file: { select: { id: true, filename: true, sizeBytes: true, mimeType: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    who: r.changedBy,
    action: `${r.fromStatus} → ${r.toStatus}`,
    time: r.createdAt.toISOString().slice(0, 16).replace("T", " "),
    comment: r.comment ?? undefined,
    files: r.submissionFiles.length
      ? r.submissionFiles.map((sf) => ({
          id: sf.file.id,
          filename: sf.file.filename,
          sizeBytes: sf.file.sizeBytes,
          mimeType: sf.file.mimeType,
        }))
      : undefined,
  }));
});
