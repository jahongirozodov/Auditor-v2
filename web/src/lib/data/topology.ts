import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { buildTopology } from "@/lib/analysis/topology/build";
import { parseTopologyAnalysis, type TopologyAiAnalysis } from "@/lib/ai/prompts";
import type { Topology } from "@/lib/types/entities";

/**
 * Network topology (TZ §10.4) — built from real backend data (analyzed devices +
 * finding assets as nodes, traffic IP-pairs as edges). See `analysis/topology/build`.
 */
export const getTopology = cache(
  async (auditId: string): Promise<Topology> => buildTopology(auditId),
);

/** Latest persisted AI analysis for an audit's topology — hydrates the screen. */
export const getLatestTopologyAnalysis = cache(
  async (auditId: string): Promise<TopologyAiAnalysis | null> => {
    const row = await prisma.topologyAiAnalysis.findFirst({
      where: { auditId, ok: true },
      orderBy: { createdAt: "desc" },
      select: { output: true },
    });
    return parseTopologyAnalysis(row?.output);
  },
);

/** The audit with the most topology-relevant data — the page's default selection. */
export const pickDefaultAuditId = cache(async (): Promise<string | null> => {
  const byFindings = await prisma.finding.groupBy({ by: ["auditId"], _count: { _all: true } });
  if (byFindings.length) {
    return byFindings.sort((a, b) => b._count._all - a._count._all)[0].auditId;
  }
  const traffic = await prisma.trafficUpload.findFirst({
    orderBy: { createdAt: "desc" },
    select: { auditId: true },
  });
  if (traffic) return traffic.auditId;
  const cfg = await prisma.configUpload.findFirst({
    orderBy: { createdAt: "desc" },
    select: { auditId: true },
  });
  return cfg?.auditId ?? null;
});
