import "server-only";
import { generateJson, getTrafficModel } from "@/lib/ai/ollama";
import {
  SYSTEM,
  TRAFFIC_JSON_SCHEMA,
  buildTrafficPrompt,
  parseTrafficAnalysis,
  type TrafficAiAnalysis,
} from "@/lib/ai/prompts";
import type { TrafficParseResult } from "./types";

export interface AnalyzeTrafficResult {
  ok: boolean;
  /** Present only when ok — the validated structured analysis. */
  analysis?: TrafficAiAnalysis;
  /** Raw model output (stored verbatim); "" on failure. */
  raw: string;
  tokens: number;
  latencyMs: number;
}

/**
 * AI-driven traffic analyzer over the deterministic parser output. Sends the
 * anomalies + profile to the local model and validates the structured reply.
 * Never throws — an unreachable model or unparseable reply resolves to
 * `{ ok: false }` so the caller can surface the hard-dependency error.
 */
export async function analyzeTrafficAI(
  filename: string,
  parseResult: TrafficParseResult,
): Promise<AnalyzeTrafficResult> {
  const prompt = `${SYSTEM.traffic}\n\n${buildTrafficPrompt(filename, parseResult)}`;
  const reply = await generateJson(prompt, TRAFFIC_JSON_SCHEMA, {
    numPredict: 4096,
    model: getTrafficModel(),
  });
  const analysis = reply.ok ? parseTrafficAnalysis(reply.raw) : null;
  if (!analysis) {
    return { ok: false, raw: reply.raw, tokens: reply.tokens, latencyMs: reply.latencyMs };
  }
  return { ok: true, analysis, raw: reply.raw, tokens: reply.tokens, latencyMs: reply.latencyMs };
}
