import "server-only";

export interface OllamaConfig {
  url: string;
  model: string;
  timeoutMs: number;
}

/** Air-gapped defaults; all overridable via env (docs/05 — local Ollama, port 11434). */
export function getOllamaConfig(): OllamaConfig {
  return {
    url: (process.env.OLLAMA_URL || "http://127.0.0.1:11434").replace(/\/+$/, ""),
    model: process.env.OLLAMA_MODEL || "qwen2.5:14b-instruct",
    timeoutMs: Number(process.env.OLLAMA_TIMEOUT_MS) || 30_000,
  };
}

/** AI is on unless explicitly disabled (`AI_DISABLED=1`) — e.g. when no LLM is provisioned. */
export function isAiEnabled(): boolean {
  return process.env.AI_DISABLED !== "1";
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
  const { url, model, timeoutMs } = getOllamaConfig();
  const started = Date.now();
  try {
    const resp = await fetch(`${url}/api/generate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, prompt, stream: false, options: { temperature: 0.2 } }),
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
