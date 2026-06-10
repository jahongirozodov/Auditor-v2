import type { TrafficAnomaly } from "./types";
import type { FindingRowInput } from "@/lib/actions/findings";

export const TRAFFIC_FINDING_TYPE = "Trafik anomaliyasi";

const SEV_CVSS: Record<string, number> = {
  critical: 9.5,
  high: 7.5,
  medium: 5.5,
  low: 3.0,
  info: 1.0,
};

export function trafficAnomalyToFindingInput(
  a: TrafficAnomaly,
  ctx: { auditId: string; taskId: string },
): FindingRowInput {
  const sev = a.severity === "info" ? "low" : a.severity;
  const parts = [a.title];
  if (a.srcIp) parts.push(`Manba IP: ${a.srcIp}`);
  if (a.dstIpPort) parts.push(`Maqsad: ${a.dstIpPort}`);
  if (a.timeRange) parts.push(`Vaqt oralig'i: ${a.timeRange}`);
  parts.push(`Hodisalar soni: ${a.eventCount}`);

  return {
    auditId: ctx.auditId,
    taskId: ctx.taskId,
    title: a.title,
    severity: sev,
    cvss: SEV_CVSS[sev] ?? 5.0,
    asset: a.srcIp ?? "N/A",
    type: TRAFFIC_FINDING_TYPE,
    cwe: "",
    description: parts.join(". "),
  };
}
