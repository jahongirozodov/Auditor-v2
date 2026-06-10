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
export const getAssignableTasks = cache(
  async (userId: string, role: RoleCode): Promise<Task[]> => {
    const where =
      role === "super" || role === "head" ? {} : { audit: { leaderId: userId } };
    return (await prisma.task.findMany({ where, orderBy: { id: "asc" } })).map(toTask);
  },
);

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

export interface TaskHistoryEntry {
  who: string;
  action: string;
  time: string;
  comment?: string;
}

export const getTaskStatusHistory = cache(async (taskId: string): Promise<TaskHistoryEntry[]> => {
  const rows = await prisma.taskStatusHistory.findMany({
    where: { taskId },
    orderBy: { createdAt: "asc" },
  });
  return rows.map((r) => ({
    who: r.changedBy,
    action: `${r.fromStatus} → ${r.toStatus}`,
    time: r.createdAt.toISOString().slice(0, 16).replace("T", " "),
    comment: r.comment ?? undefined,
  }));
});
