import { FINDING_STATUS_LABELS, STATUS_LABELS } from "@/lib/fixtures";
import type { AuditStatus, FindingStatus } from "@/lib/types/entities";
import { Tag } from "./Tag";

/** Audit status pill — maps STATUS_LABELS (semantic tone + label) onto Tag. */
export function StatusTag({ status }: { status: AuditStatus }) {
  const s = STATUS_LABELS[status];
  return <Tag tone={s.tone}>{s.label}</Tag>;
}

/** Finding status pill — all 8 states incl. remediation (FINDING_STATUS_LABELS). */
export function FindingStatusTag({ status }: { status: FindingStatus }) {
  const s = FINDING_STATUS_LABELS[status];
  return <Tag tone={s.tone}>{s.label}</Tag>;
}
