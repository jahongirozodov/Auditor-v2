/**
 * Finding remediation machine — the post-approval lifecycle
 * (approved → fixing → fixed → retest → closed | retest → fixing).
 * Pure; shared by `RemediationFlow` (button rendering) and the server action (guards).
 * Mirrors `tasks-machine.ts`.
 */
import { isLead } from "@/lib/tasks-machine";
import type { FindingStatus } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

export type RemediationAction =
  | "startFixing"
  | "markFixed"
  | "startRetest"
  | "passRetest"
  | "failRetest";

export interface RemediationCtx {
  role: RoleCode;
  /** The session user is the assignee of the finding's linked task. */
  isAssignee: boolean;
}

interface Transition {
  from: FindingStatus[];
  to: FindingStatus;
  needsComment?: boolean;
  allow: (c: RemediationCtx) => boolean;
}

// Assignee (or a lead) fixes; a group lead retests + closes.
const fixer = (c: RemediationCtx) => c.isAssignee || isLead(c.role);
const lead = (c: RemediationCtx) => isLead(c.role);

export const REMEDIATION_TRANSITIONS: Record<RemediationAction, Transition> = {
  startFixing: { from: ["approved"], to: "fixing", allow: fixer },
  markFixed: { from: ["fixing"], to: "fixed", allow: fixer },
  startRetest: { from: ["fixed"], to: "retest", allow: lead },
  passRetest: { from: ["retest"], to: "closed", allow: lead },
  failRetest: { from: ["retest"], to: "fixing", needsComment: true, allow: lead },
};

export interface RemediationGuardResult {
  ok: boolean;
  reason?: "unknown" | "illegal_transition" | "forbidden" | "comment_required";
  to?: FindingStatus;
}

/** Validate a remediation action against the current status + actor (no side effects). */
export function canDoRemediation(
  action: RemediationAction,
  status: FindingStatus,
  ctx: RemediationCtx,
  comment?: string,
): RemediationGuardResult {
  const tr = REMEDIATION_TRANSITIONS[action];
  if (!tr) return { ok: false, reason: "unknown" };
  if (!tr.from.includes(status)) return { ok: false, reason: "illegal_transition" };
  if (!tr.allow(ctx)) return { ok: false, reason: "forbidden" };
  if (tr.needsComment && !comment?.trim()) return { ok: false, reason: "comment_required" };
  return { ok: true, to: tr.to };
}

/** Remediation actions available for a status (drives RemediationFlow buttons). */
export function remediationActionsFor(status: FindingStatus): RemediationAction[] {
  return (Object.keys(REMEDIATION_TRANSITIONS) as RemediationAction[]).filter((a) =>
    REMEDIATION_TRANSITIONS[a].from.includes(status),
  );
}

/** Post-approval statuses where the remediation strip is shown. */
export const REMEDIATION_STATUSES: FindingStatus[] = [
  "approved",
  "fixing",
  "fixed",
  "retest",
  "closed",
];
