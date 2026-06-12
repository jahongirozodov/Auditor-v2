/**
 * Task lifecycle machine — shared by `TaskDetailScreen` (button rendering) and the
 * server task actions (guards). Pure; mirrors the prototype's ACTIONS map.
 */
import type { TaskStatus } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

export type TaskAction =
  | "assign"
  | "start"
  | "submit"
  | "approve"
  | "approve_head"
  | "return"
  | "restart"
  | "unblock";

/** Roles that act as a group lead (no explicit duty column yet — 1C hardening). */
export const LEAD_ROLES: RoleCode[] = ["chief", "lead", "head", "super"];
export const isLead = (role: RoleCode): boolean => LEAD_ROLES.includes(role);

export interface TaskActorCtx {
  role: RoleCode;
  isAssignee: boolean;
  isAuditLeader: boolean;
  isSuper: boolean;
}

interface Transition {
  from: TaskStatus[];
  to: TaskStatus;
  needsComment?: boolean;
  allow: (c: TaskActorCtx) => boolean;
}

export const TASK_TRANSITIONS: Record<TaskAction, Transition> = {
  assign: { from: ["new"], to: "assigned", allow: (c) => isLead(c.role) },
  start: {
    from: ["assigned", "new"],
    to: "in_progress",
    allow: (c) => c.isAssignee || isLead(c.role),
  },
  submit: {
    from: ["in_progress"],
    to: "review",
    needsComment: true,
    allow: (c) => c.isAssignee || isLead(c.role),
  },
  // Stage 1: Guruh rahbari (audit leader) passes to head stage
  approve: {
    from: ["review"],
    to: "review_head",
    allow: (c) => !c.isAssignee && (c.isAuditLeader || c.isSuper),
  },
  // Stage 2: Bo'lim boshlig'i (head/super) gives final approval
  approve_head: {
    from: ["review_head"],
    to: "done",
    allow: (c) => !c.isAssignee && (c.role === "head" || c.isSuper),
  },
  return: {
    from: ["review", "review_head"],
    to: "returned",
    needsComment: true,
    allow: (c) => !c.isAssignee && (c.isAuditLeader || c.role === "head" || c.isSuper),
  },
  restart: {
    from: ["returned"],
    to: "in_progress",
    allow: (c) => c.isAssignee || isLead(c.role),
  },
  unblock: { from: ["blocked"], to: "in_progress", allow: (c) => isLead(c.role) },
};

export interface TaskGuardResult {
  ok: boolean;
  reason?: "unknown" | "illegal_transition" | "forbidden" | "comment_required";
  to?: TaskStatus;
}

/** Validate a task action against the current status + actor (no side effects). */
export function canDoTask(
  action: TaskAction,
  status: TaskStatus,
  ctx: TaskActorCtx,
  comment?: string,
): TaskGuardResult {
  const tr = TASK_TRANSITIONS[action];
  if (!tr) return { ok: false, reason: "unknown" };
  if (!tr.from.includes(status)) return { ok: false, reason: "illegal_transition" };
  if (!tr.allow(ctx)) return { ok: false, reason: "forbidden" };
  if (tr.needsComment && !comment?.trim()) return { ok: false, reason: "comment_required" };
  return { ok: true, to: tr.to };
}

/** Button actions available for a status (drives TaskDetailScreen). */
export function actionsFor(status: TaskStatus, ctx?: TaskActorCtx): TaskAction[] {
  const actions = (Object.keys(TASK_TRANSITIONS) as TaskAction[]).filter((a) =>
    TASK_TRANSITIONS[a].from.includes(status),
  );
  if (!ctx) return actions;
  return actions.filter((action) => {
    const transition = TASK_TRANSITIONS[action];
    const comment = transition.needsComment ? "__visible__" : undefined;
    return canDoTask(action, status, ctx, comment).ok;
  });
}
