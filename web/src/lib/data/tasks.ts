import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Task, TaskPriority, TaskStatus } from "@/lib/types/entities";

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
