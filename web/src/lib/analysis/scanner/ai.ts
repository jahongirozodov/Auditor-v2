import "server-only";
import { generateJson } from "@/lib/ai/ollama";
import {
  SYSTEM,
  SCANNER_JSON_SCHEMA,
  buildScannerPrompt,
  parseScannerNormalization,
} from "@/lib/ai/prompts";
import type { ScannerFinding, ScannerNormalization, ScannerType } from "./types";

/** Cap on findings sent to the model in one pass — keeps output within token budget. */
export const MAX_AI_FINDINGS = 80;

const SEV_RANK: Record<ScannerFinding["severity"], number> = {
  critical: 5,
  high: 4,
  medium: 3,
  low: 2,
  info: 1,
};

export interface NormalizeScannerResult {
  ok: boolean;
  normalization?: ScannerNormalization;
  raw: string;
  tokens: number;
  latencyMs: number;
}

/** Carry an un-normalized finding through unchanged (AI cap remainder / fallback). */
function passthrough(f: ScannerFinding): ScannerNormalization["findings"][number] {
  return {
    title: f.title,
    description: f.description,
    severity: f.severity,
    host: f.host,
    port: f.port,
    cve: f.cve,
    cvss: f.cvss,
    remediation: f.solution ?? "",
    mergedCount: 1,
  };
}

/**
 * AI normalization layer over the deterministic parser output: merges duplicates,
 * rewrites to plain language, and fills remediation. Never throws — an unreachable
 * model or unparseable reply resolves to `{ ok: false }` so the import degrades
 * gracefully (raw parsed findings are kept). Caps input at {@link MAX_AI_FINDINGS}
 * (highest-severity first); any remainder is appended un-normalized with a note.
 */
export async function normalizeScannerAI(
  scanner: ScannerType,
  findings: ScannerFinding[],
): Promise<NormalizeScannerResult> {
  if (findings.length === 0) {
    return { ok: false, raw: "", tokens: 0, latencyMs: 0 };
  }

  const ranked = [...findings].sort((a, b) => SEV_RANK[b.severity] - SEV_RANK[a.severity]);
  const head = ranked.slice(0, MAX_AI_FINDINGS);
  const tail = ranked.slice(MAX_AI_FINDINGS);

  const prompt = `${SYSTEM.scanner}\n\n${buildScannerPrompt(scanner, head)}`;
  const reply = await generateJson(prompt, SCANNER_JSON_SCHEMA, { numPredict: 8192 });
  const normalization = reply.ok ? parseScannerNormalization(reply.raw) : null;
  if (!normalization) {
    return { ok: false, raw: reply.raw, tokens: reply.tokens, latencyMs: reply.latencyMs };
  }

  // Append the over-cap remainder unchanged so nothing is silently dropped.
  if (tail.length > 0) {
    normalization.findings.push(...tail.map(passthrough));
    normalization.note = `AI ${head.length} ta findingni normallashtirildi; qolgan ${tail.length} ta xom holicha qoʻshildi.`;
  }
  normalization.originalCount = findings.length;
  normalization.normalizedCount = normalization.findings.length;

  return {
    ok: true,
    normalization,
    raw: reply.raw,
    tokens: reply.tokens,
    latencyMs: reply.latencyMs,
  };
}
