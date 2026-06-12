import "server-only";
import { prisma } from "@/lib/prisma";
import { getOllamaConfig } from "@/lib/ai/ollama";
import { buildTopology } from "./build";
import { enrichTopologyNodes } from "./enrich";

/**
 * Runs topology enrichment for an audit and persists the result.
 * Called fire-and-forget via after() in upload actions — never throws.
 */
export async function runTopologyEnrichment(auditId: string, userId: string): Promise<void> {
  const topology = await buildTopology(auditId);
  if (topology.nodes.length === 0) return;

  const r = await enrichTopologyNodes(topology);
  if (!r.ok) return;

  const { model } = getOllamaConfig();
  await prisma.topologyEnrichment.create({
    data: {
      auditId,
      output: r.raw,
      model,
      latencyMs: r.latencyMs,
      tokens: r.tokens,
      ok: true,
      createdById: userId,
    },
  });
}
