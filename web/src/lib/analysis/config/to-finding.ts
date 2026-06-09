import { SEV_CVSS } from "@/lib/severity";
import type { ConfigGap } from "./types";

/** Shape accepted by the finding-materialization layer (subset of CreateFindingInput). */
export interface FindingDraftInput {
  auditId: string;
  taskId: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  cvss: number;
  cwe: string;
  asset: string;
  type: string;
  description: string;
}

/** All config-analysis drafts carry this finding type (a known CreateFinding TYPE). */
export const CONFIG_FINDING_TYPE = "Konfiguratsiya kamchiligi";

/**
 * Map a detected gap to a draft-finding input. Pure. The description composes the
 * gap explanation, an optional AI note, the recommendation, and the evidence line.
 */
export function gapToFindingInput(
  gap: ConfigGap,
  ctx: { auditId: string; taskId: string; asset: string; aiNote?: string },
): FindingDraftInput {
  const parts = [gap.description.trim()];
  if (ctx.aiNote?.trim()) parts.push(ctx.aiNote.trim());
  parts.push(`Tavsiya: ${gap.recommendation}`);
  if (gap.line > 0 && gap.evidenceLine) parts.push(`Satr ${gap.line}: ${gap.evidenceLine}`);
  return {
    auditId: ctx.auditId,
    taskId: ctx.taskId,
    title: gap.title,
    severity: gap.severity,
    cvss: SEV_CVSS[gap.severity],
    cwe: gap.cwe,
    asset: ctx.asset,
    type: CONFIG_FINDING_TYPE,
    description: parts.join("\n"),
  };
}
