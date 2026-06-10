import "server-only";

export interface OllamaConfig {
  url: string;
  model: string;
  timeoutMs: number;
  temperature: number;
  maxTokens: number;
}

/** Air-gapped defaults; all overridable via env (docs/05 — local Ollama, port 11434). */
export function getOllamaConfig(): OllamaConfig {
  return {
    url: (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/+$/, ""),
    model: process.env.OLLAMA_MODEL || "qwen3-coder:30b",
    timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS) || 120_000,
    temperature: Number(process.env.OLLAMA_TEMPERATURE) || 0.2,
    maxTokens: Number(process.env.OLLAMA_MAX_TOKENS) || 2048,
  };
}

/** AI is on unless explicitly disabled (`AI_DISABLED=1`) — e.g. when no LLM is provisioned. */
export function isAiEnabled(): boolean {
  return process.env.AI_DISABLED !== "1";
}

/**
 * Model to use for the traffic analyzer. Defaults to the tuned `auditor-traffic`
 * Ollama model (built from `ollama/auditor-traffic.Modelfile`); override or fall
 * back to the base model via env when the custom model is not provisioned.
 */
export function getTrafficModel(): string {
  return process.env.OLLAMA_TRAFFIC_MODEL || "auditor-traffic";
}

export interface OllamaReply {
  ok: boolean;
  text: string;
  tokens: number;
  latencyMs: number;
}

/**
 * Strip control characters (keep tab=9, newline=10, carriage-return=13) and cap
 * length — output is rendered as plain text, never HTML. Code-point filter avoids
 * a control-char regex literal.
 */
function sanitize(s: string): string {
  let out = "";
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 0;
    if (code < 32 && code !== 9 && code !== 10 && code !== 13) continue;
    out += ch;
  }
  return out.slice(0, 8000).trim();
}

/**
 * Call local Ollama `/api/generate` (non-streaming). Never throws — any failure
 * (unreachable, timeout, non-2xx) resolves to `{ ok: false }` so the pipeline
 * degrades gracefully and draft creation can proceed without AI text.
 */
export async function generate(prompt: string): Promise<OllamaReply> {
  const { url, model, timeoutMs, temperature, maxTokens } = getOllamaConfig();
  const started = Date.now();
  try {
    const resp = await fetch(`${url}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        options: { temperature, num_predict: maxTokens },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!resp.ok) return { ok: false, text: "", tokens: 0, latencyMs: Date.now() - started };
    const data = (await resp.json()) as { response?: string; eval_count?: number };
    return {
      ok: true,
      text: sanitize(data.response ?? ""),
      tokens: data.eval_count ?? 0,
      latencyMs: Date.now() - started,
    };
  } catch {
    return { ok: false, text: "", tokens: 0, latencyMs: Date.now() - started };
  }
}

export interface OllamaJsonReply {
  ok: boolean;
  /** Raw JSON text exactly as returned (stored verbatim); empty on failure. */
  raw: string;
  tokens: number;
  latencyMs: number;
}

/**
 * Call Ollama `/api/generate` in structured-output mode (`format` = a JSON Schema).
 * Returns the raw model text; the caller validates it against its own zod schema.
 * Same never-throws contract as {@link generate} — any failure → `{ ok: false }`.
 */
export async function generateJson(
  prompt: string,
  jsonSchema: unknown,
  opts?: { numPredict?: number; model?: string },
): Promise<OllamaJsonReply> {
  const { url, model: defaultModel, timeoutMs, temperature, maxTokens } = getOllamaConfig();
  const model = opts?.model || defaultModel;
  const started = Date.now();
  try {
    const resp = await fetch(`${url}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        prompt,
        stream: false,
        format: jsonSchema,
        options: { temperature, num_predict: opts?.numPredict ?? maxTokens },
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!resp.ok) return { ok: false, raw: "", tokens: 0, latencyMs: Date.now() - started };
    const data = (await resp.json()) as { response?: string; eval_count?: number };
    return {
      ok: true,
      raw: sanitize(data.response ?? ""),
      tokens: data.eval_count ?? 0,
      latencyMs: Date.now() - started,
    };
  } catch {
    return { ok: false, raw: "", tokens: 0, latencyMs: Date.now() - started };
  }
}
