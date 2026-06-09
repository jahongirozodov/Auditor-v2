import { SEV_CVSS } from "@/lib/severity";
import type { ScannerFinding } from "./types";
import type { FindingRowInput } from "@/lib/actions/findings";

export const SCANNER_FINDING_TYPE = "Skaner topilmasi";

export function scannerFindingToFindingInput(
  f: ScannerFinding,
  ctx: { auditId: string; taskId: string; asset: string },
): FindingRowInput {
  const parts = [f.description.trim()];
  if (f.solution?.trim()) parts.push(`Tavsiya: ${f.solution.trim()}`);
  if (f.cve?.length) parts.push(`CVE: ${f.cve.join(", ")}`);
  if (f.pluginOutput?.trim()) parts.push(f.pluginOutput.trim());

  const sev = f.severity === "info" ? "low" : f.severity;

  return {
    auditId: ctx.auditId,
    taskId: ctx.taskId,
    title: f.title,
    severity: sev,
    cvss: f.cvss ?? SEV_CVSS[sev],
    cwe: "",
    asset: f.host ? `${ctx.asset} (${f.host}${f.port ? `:${f.port}` : ""})` : ctx.asset,
    type: SCANNER_FINDING_TYPE,
    description: parts.join("\n"),
  };
}
