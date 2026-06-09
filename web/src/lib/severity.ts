import type { Severity } from "@/lib/types/entities";

/**
 * CVSS v3.1 default base score per severity. Used as the editable default in the
 * finding form and as the score for parser-derived config-analysis drafts.
 * Single source of truth — imported by the create-finding UI and the config
 * gap → finding mapper so the two never drift.
 */
export const SEV_CVSS: Record<Severity, number> = {
  critical: 9.1,
  high: 7.4,
  medium: 5.4,
  low: 3.0,
  info: 0,
};
