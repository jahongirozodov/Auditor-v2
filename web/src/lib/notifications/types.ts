import "server-only";

export const NOTIFICATION_TYPES = [
  "task_assigned",
  "task_reassigned",
  "task_returned",
  "task_review",
  "finding_critical",
  "finding_returned",
  "finding_approved",
  "finding_retest_failed",
  "report_ready",
  "report_approved",
  "report_returned",
  "sync_complete",
  "audit_member_added",
  "audit_promoted",
  "project_approved",
  "project_returned",
  "appeal_status_changed",
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

/** Maps a type to the global settings toggle that gates it. Types absent here always fire. */
export const NOTIF_GATING: Partial<
  Record<NotificationType, "nCritical" | "nReturn" | "nAssign" | "nReport" | "nSync">
> = {
  finding_critical: "nCritical",
  finding_returned: "nReturn",
  task_assigned: "nAssign",
  task_reassigned: "nAssign",
  report_ready: "nReport",
  sync_complete: "nSync",
};

/** Free-form params persisted on the row and passed to i18n at render time. */
export type NotifParams = Record<string, string | number>;
