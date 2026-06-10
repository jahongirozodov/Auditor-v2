import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAgent } from "@/lib/agent/auth";
import { canDoTask, TASK_TRANSITIONS, type TaskAction } from "@/lib/tasks-machine";
import type { RoleCode } from "@/lib/types/roles";
import type { TaskStatus } from "@/lib/types/entities";
import { json, clientIp } from "@/lib/agent/util";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));
const Body = z.object({ toStatus: z.enum(["in_progress", "done"]) });

// Recompute the denormalized Audit.tasksAgg (mirrors actions/tasks.ts).
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

/** Resolve the machine action that moves `from` → `toStatus`, if one is legal. */
function actionFor(from: TaskStatus, toStatus: TaskStatus): TaskAction | null {
  for (const [action, tr] of Object.entries(TASK_TRANSITIONS))
    if (tr.to === toStatus && tr.from.includes(from)) return action as TaskAction;
  return null;
}

/**
 * Agent updates one of its tasks' status (two-way sync). The agent is the field
 * assignee; the change goes through the same task state-machine guard as the web
 * (`canDoTask`), and must target a task inside the token's audit.
 */
export async function POST(req: Request, ctx: { params: Promise<{ taskId: string }> }) {
  const auth = await requireAgent(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const { userId, auditId, tokenId } = auth.identity;

  const { taskId } = await ctx.params;
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ ok: false, error: "invalid" }, 400);
  const { toStatus } = parsed.data;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { auditId: true, status: true, assigneeId: true },
  });
  if (!task) return json({ ok: false, error: "not_found" }, 404);
  if (task.auditId !== auditId) return json({ ok: false, error: "task_scope" }, 403);

  const from = task.status as TaskStatus;
  if (from === toStatus) return json({ ok: true, status: toStatus }); // idempotent no-op

  const action = actionFor(from, toStatus);
  if (!action) return json({ ok: false, error: "illegal_transition" }, 409);

  // The agent acts as the task assignee. Role is irrelevant for assignee-allowed actions.
  const guard = canDoTask(action, from, {
    role: "t1" as RoleCode,
    isAssignee: task.assigneeId === userId,
    isAuditLeader: false,
    isSuper: false,
  });
  if (!guard.ok) return json({ ok: false, error: guard.reason }, 403);

  await prisma.$transaction(async (tx) => {
    await tx.task.update({ where: { id: taskId }, data: { status: toStatus } });
    await tx.taskStatusHistory.create({
      data: { taskId, fromStatus: from, toStatus, changedBy: userId, comment: null },
    });
    await tx.auditTokenUsageLog.create({
      data: { tokenId, action: "task.status", status: "ok", ip: clientIp(req) },
    });
    await tx.auditLog.create({
      data: {
        userId,
        action: `agent.task.${action}`,
        entity: taskId,
        level: "info",
        payload: J({ from, to: toStatus, auditId }),
      },
    });
    await recountTasksAgg(tx, auditId);
  });

  return json({ ok: true, status: toStatus });
}
