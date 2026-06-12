import "server-only";
import { generateJson } from "@/lib/ai/ollama";
import {
  SYSTEM,
  TOPOLOGY_JSON_SCHEMA,
  buildTopologyPrompt,
  parseTopologyAnalysis,
} from "@/lib/ai/prompts";
import type { Topology } from "@/lib/types/entities";
import type { TopologyAnalysis } from "./types";

export interface AnalyzeTopologyResult {
  ok: boolean;
  analysis?: TopologyAnalysis;
  raw: string;
  tokens: number;
  latencyMs: number;
}

/**
 * AI analysis over a deterministically-built topology: overall risk, critical
 * nodes, attack paths, segmentation issues, recommendations. Never throws — an
 * unreachable model or unparseable reply resolves to `{ ok: false }` so the graph
 * (already rendered) is unaffected.
 */
export async function analyzeTopologyAI(topology: Topology): Promise<AnalyzeTopologyResult> {
  if (topology.nodes.length === 0) {
    return { ok: false, raw: "", tokens: 0, latencyMs: 0 };
  }
  const prompt = `${SYSTEM.topology}\n\n${buildTopologyPrompt(topology)}`;
  const reply = await generateJson(prompt, TOPOLOGY_JSON_SCHEMA, { numPredict: 4096 });
  const analysis = reply.ok ? parseTopologyAnalysis(reply.raw) : null;
  if (!analysis) {
    return { ok: false, raw: reply.raw, tokens: reply.tokens, latencyMs: reply.latencyMs };
  }
  return { ok: true, analysis, raw: reply.raw, tokens: reply.tokens, latencyMs: reply.latencyMs };
}
