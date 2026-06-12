import "server-only";
import { generateJson } from "@/lib/ai/ollama";
import {
  SYSTEM,
  TOPOLOGY_ENRICH_JSON_SCHEMA,
  buildEnrichmentPrompt,
  parseTopologyEnrichment,
  type EnrichedNodePatchAi,
} from "@/lib/ai/prompts";
import type { Topology } from "@/lib/types/entities";

export interface EnrichTopologyResult {
  ok: boolean;
  patches: EnrichedNodePatchAi[];
  raw: string;
  tokens: number;
  latencyMs: number;
}

/**
 * AI reclassification of topology nodes: sends heuristic nodes to Ollama,
 * receives per-node patches with corrected kind/segment + aiLabel/aiReason.
 * Never throws — unreachable model or unparseable reply resolves to ok:false.
 */
export async function enrichTopologyNodes(topology: Topology): Promise<EnrichTopologyResult> {
  if (topology.nodes.length === 0) {
    return { ok: false, patches: [], raw: "", tokens: 0, latencyMs: 0 };
  }
  const prompt = `${SYSTEM.topology_enrich}\n\n${buildEnrichmentPrompt(topology)}`;
  const reply = await generateJson(prompt, TOPOLOGY_ENRICH_JSON_SCHEMA, { numPredict: 2048 });
  const patches = reply.ok ? parseTopologyEnrichment(reply.raw) : null;
  if (!patches) {
    return {
      ok: false,
      patches: [],
      raw: reply.raw,
      tokens: reply.tokens,
      latencyMs: reply.latencyMs,
    };
  }
  return { ok: true, patches, raw: reply.raw, tokens: reply.tokens, latencyMs: reply.latencyMs };
}
