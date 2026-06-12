/**
 * 3-step approval logic — shared by the client `ApprovalFlow` and the server
 * finding actions (single source of truth). Pure; no Prisma, no "server-only".
 */
import type {
  ApprovalStage,
  ApprovalStageKey,
  AuditProjectStatus,
  AuditStatus,
  FindingStatus,
  ReportStatus,
} from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

export const APPROVAL_STAGES: ApprovalStage[] = [
  { key: "group_lead", title: "Guruh rahbari", role: "Tasdiqlash", who: "" },
  { key: "head", title: "Boʻlim boshligʻi", role: "Tasdiqlash", who: "" },
  { key: "dept", title: "Departament rahbari", role: "Yakuniy tasdiq", who: "" },
];

/** Which canonical roles may act at each stage (ADR-0006 mapping). */
export const CAN_ACT: Record<ApprovalStageKey, RoleCode[]> = {
  group_lead: ["chief", "lead", "head", "super"],
  head: ["head", "super"],
  dept: ["super"],
};

export const STAGE_ORDER: ApprovalStageKey[] = ["group_lead", "head", "dept"];

/** ApprovalFlow's `current`: a stage in review, "returned", "new" (pre-submit), or null (approved). */
export type ApprovalCurrent = ApprovalStageKey | "returned" | "new" | null;

export function canActAt(role: RoleCode, stage: ApprovalStageKey): boolean {
  return CAN_ACT[stage].includes(role);
}

/** Next stage after `stage`, or null when `stage` is the last (dept). */
export function nextStage(stage: ApprovalStageKey): ApprovalStageKey | null {
  const i = STAGE_ORDER.indexOf(stage);
  return i >= 0 && i < STAGE_ORDER.length - 1 ? STAGE_ORDER[i + 1] : null;
}

/** Map a finding's status + stored stage onto the approval strip's `current`. */
export function currentOf(
  status: FindingStatus,
  approvalStage: string | null | undefined,
): ApprovalCurrent {
  if (status === "new") return "new";
  if (status === "returned") return "returned";
  if (status === "review") return (approvalStage as ApprovalStageKey) ?? "group_lead";
  // approved + remediation sub-states (fixing/fixed/retest/closed) → fully approved strip.
  return null;
}

/**
 * Project approval strip mapping. Unlike findings, the group lead is the SUBMITTER
 * (their submit completes the group_lead stage), so the first approver is `head`.
 */
export function projectCurrentOf(
  status: AuditStatus,
  projectStage: string | null | undefined,
): ApprovalCurrent {
  if (status === "project_draft") return "new";
  if (status === "returned") return "returned";
  if (status === "project_pending") return (projectStage as ApprovalStageKey) ?? "head";
  if (status === "head_approved") return "dept";
  // assigning/in_progress/review/approved/completed → project already approved (or not started).
  return null;
}

/** Map an AuditProject status + stored stage onto the approval strip's `current`. */
export function auditProjectCurrentOf(
  status: AuditProjectStatus,
  currentApprovalStage: string | null | undefined,
): ApprovalCurrent {
  if (status === "draft") return "new";
  if (status === "returned") return "returned";
  if (status === "submitted") return (currentApprovalStage as ApprovalStageKey) ?? "head";
  return null;
}

/**
 * Map a report's status + stored stage onto the approval strip's `current`.
 * Reports share the 3-stage flow: the author submits a draft (group_lead → head →
 * dept approve). "returned" sends it back to the author for edits.
 */
export function reportCurrentOf(
  status: ReportStatus,
  approvalStage: string | null | undefined,
): ApprovalCurrent {
  if (status === "draft") return "new";
  if (status === "returned") return "returned";
  if (status === "review") return (approvalStage as ApprovalStageKey) ?? "group_lead";
  // approved
  return null;
}
