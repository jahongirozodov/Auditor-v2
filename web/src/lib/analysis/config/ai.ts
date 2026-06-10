import "server-only";
import { generateJson } from "@/lib/ai/ollama";
import {
  SYSTEM,
  CONFIG_JSON_SCHEMA,
  buildConfigPrompt,
  parseConfigAnalysis,
} from "@/lib/ai/prompts";
import type { ConfigAnalysis } from "./types";

export interface AnalyzeConfigResult {
  ok: boolean;
  /** Present only when ok — the validated structured analysis. */
  analysis?: ConfigAnalysis;
  /** Raw model output (stored verbatim in AiAnalysisResult); "" on failure. */
  raw: string;
  tokens: number;
  latencyMs: number;
}

/** Strip directory + extension → a usable device-name fallback. */
function baseName(filename: string): string {
  const file = filename.split(/[\\/]/).pop() ?? filename;
  return file.replace(/\.[^.]+$/, "") || file;
}

/**
 * AI-driven config analyzer. Sends the numbered config to the local model and
 * validates the structured reply. Never throws — an unreachable model or an
 * unparseable reply both resolve to `{ ok: false }` so callers can surface the
 * hard-dependency error. Guarantees a non-empty hostname when ok.
 */
export async function analyzeConfigAI(
  filename: string,
  content: string,
): Promise<AnalyzeConfigResult> {
  const prompt = `${SYSTEM.config}\n\n${buildConfigPrompt(filename, content)}`;
  // Config analysis can emit many gaps — give it more headroom than the chat default.
  const reply = await generateJson(prompt, CONFIG_JSON_SCHEMA, { numPredict: 4096 });
  const analysis = reply.ok ? parseConfigAnalysis(reply.raw) : null;
  if (!analysis) {
    return { ok: false, raw: reply.raw, tokens: reply.tokens, latencyMs: reply.latencyMs };
  }
  if (!analysis.device.hostname) analysis.device.hostname = baseName(filename);
  return { ok: true, analysis, raw: reply.raw, tokens: reply.tokens, latencyMs: reply.latencyMs };
}
