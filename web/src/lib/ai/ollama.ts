import "server-only";

export interface OllamaConfig {
  url: string;
  model: string;
  timeoutMs: number;
  temperature: number;
  maxTokens: number;
}

/**
 * Air-gapped defaults; all overridable via env.
 * OLLAMA_URL is the base URL without path — works for both Ollama
 * (http://127.0.0.1:11434) and LM Studio (http://localhost:1234).
 * Calls use the OpenAI-compatible /v1/chat/completions endpoint.
 */
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
  return process.env.OLLAMA_TRAFFIC_MODEL || getOllamaConfig().model;
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
 * Strip <think>…</think> reasoning blocks and markdown JSON fences that
 * thinking models (e.g. qwen3) may prepend to structured output. Applied
 * only to generateJson responses so plain-text chat is unaffected.
 */
function stripJsonNoise(s: string): string {
  // Remove <think>...</think> blocks (including newlines inside)
  let cleaned = s.replace(/<think>[\s\S]*?<\/think>/gi, "");
  cleaned = cleaned.trim();
  // Unwrap ```json ... ``` or ``` ... ``` fences
  const fenceMatch = cleaned.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/);
  if (fenceMatch) cleaned = fenceMatch[1];
  return cleaned.trim();
}

/**
 * Call local LLM via OpenAI-compatible `/v1/chat/completions` (non-streaming).
 * Works with both Ollama (≥0.1.24) and LM Studio. Never throws — any failure
 * (unreachable, timeout, non-2xx) resolves to `{ ok: false }` so the pipeline
 * degrades gracefully and draft creation can proceed without AI text.
 */
export async function generate(prompt: string): Promise<OllamaReply> {
  const { url, model, timeoutMs, temperature, maxTokens } = getOllamaConfig();
  const started = Date.now();
  try {
    const resp = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        stream: false,
        temperature,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!resp.ok) return { ok: false, text: "", tokens: 0, latencyMs: Date.now() - started };
    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { completion_tokens?: number };
    };
    return {
      ok: true,
      text: sanitize(data.choices?.[0]?.message?.content ?? ""),
      tokens: data.usage?.completion_tokens ?? 0,
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
 * Call local LLM via OpenAI-compatible `/v1/chat/completions` requesting JSON.
 * No response_format constraint is sent — LM Studio only accepts json_schema/text,
 * and Ollama's json_object mode is unreliable across versions. Instead the JSON
 * schema is embedded in the prompt so the model knows the exact output shape, and
 * stripJsonNoise() removes any thinking blocks or markdown fences prepended.
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
  const schemaBlock = jsonSchema
    ? `\nReturn ONLY a valid JSON object matching this JSON Schema (no extra text, no markdown):\n${JSON.stringify(jsonSchema)}\n`
    : "";
  const fullPrompt = schemaBlock + prompt;
  try {
    const resp = await fetch(`${url}/v1/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: fullPrompt }],
        stream: false,
        temperature,
        max_tokens: opts?.numPredict ?? maxTokens,
      }),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!resp.ok) {
      const errBody = await resp.text().catch(() => "");
      console.error(`[AI] generateJson HTTP ${resp.status}: ${errBody.slice(0, 200)}`);
      return { ok: false, raw: "", tokens: 0, latencyMs: Date.now() - started };
    }
    const data = (await resp.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { completion_tokens?: number };
    };
    const raw = stripJsonNoise(sanitize(data.choices?.[0]?.message?.content ?? ""));
    return {
      ok: true,
      raw,
      tokens: data.usage?.completion_tokens ?? 0,
      latencyMs: Date.now() - started,
    };
  } catch (e) {
    console.error(`[AI] generateJson fetch failed:`, e);
    return { ok: false, raw: "", tokens: 0, latencyMs: Date.now() - started };
  }
}
