import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generate, generateJson, getOllamaConfig, isAiEnabled } from "./ollama";

function mockFetchOnce(impl: () => unknown) {
  const fn = vi.fn(impl);
  vi.stubGlobal("fetch", fn);
  return fn;
}

beforeEach(() => {
  vi.stubEnv("OLLAMA_URL", "http://ai.local:11434");
  vi.stubEnv("OLLAMA_MODEL", "qwen3-coder:30b");
  vi.stubEnv("OLLAMA_TEMPERATURE", "0.2");
  vi.stubEnv("OLLAMA_MAX_TOKENS", "2048");
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("getOllamaConfig", () => {
  it("reads env and strips trailing slashes from the URL", () => {
    vi.stubEnv("OLLAMA_URL", "http://ai.local:11434///");
    const cfg = getOllamaConfig();
    expect(cfg.url).toBe("http://ai.local:11434");
    expect(cfg.model).toBe("qwen3-coder:30b");
    expect(cfg.temperature).toBe(0.2);
    expect(cfg.maxTokens).toBe(2048);
  });

  it("defaults to qwen3-coder:30b and a 120s timeout when env is unset", () => {
    vi.unstubAllEnvs();
    const cfg = getOllamaConfig();
    expect(cfg.model).toBe("qwen3-coder:30b");
    expect(cfg.timeoutMs).toBe(120_000);
  });
});

describe("isAiEnabled", () => {
  it("is enabled unless AI_DISABLED=1", () => {
    expect(isAiEnabled()).toBe(true);
    vi.stubEnv("AI_DISABLED", "1");
    expect(isAiEnabled()).toBe(false);
  });
});

describe("generateJson", () => {
  it("posts messages and returns stripped JSON on success", async () => {
    const payload = JSON.stringify({ summary: "S", overallRisk: "low", items: [] });
    const fn = mockFetchOnce(() => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: payload } }],
        usage: { completion_tokens: 42 },
      }),
    }));

    const reply = await generateJson("prompt", { type: "object" });
    expect(reply.ok).toBe(true);
    expect(reply.raw).toBe(payload);
    expect(reply.tokens).toBe(42);

    const call = fn.mock.calls[0] as unknown as [string, { body: string }];
    const body = JSON.parse(call[1].body);
    // Schema is embedded in the prompt; check it contains the original prompt text
    expect(body.messages[0].role).toBe("user");
    expect(body.messages[0].content).toContain("prompt");
    expect(body.messages[0].content).toContain("JSON Schema");
    expect(body.stream).toBe(false);
    expect(body.response_format).toBeUndefined();
    expect(body.temperature).toBe(0.2);
    expect(body.max_tokens).toBe(2048);
  });

  it("strips <think> blocks from the response", async () => {
    const payload = '{"ok":true}';
    mockFetchOnce(() => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: `<think>reasoning here</think>\n${payload}` } }],
        usage: { completion_tokens: 10 },
      }),
    }));
    const reply = await generateJson("p", {});
    expect(reply.ok).toBe(true);
    expect(reply.raw).toBe(payload);
  });

  it("strips markdown json fences from the response", async () => {
    const payload = '{"ok":true}';
    mockFetchOnce(() => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "```json\n" + payload + "\n```" } }],
        usage: { completion_tokens: 10 },
      }),
    }));
    const reply = await generateJson("p", {});
    expect(reply.ok).toBe(true);
    expect(reply.raw).toBe(payload);
  });

  it("degrades to ok:false on a non-2xx response", async () => {
    mockFetchOnce(() => ({ ok: false, json: async () => ({}) }));
    const reply = await generateJson("p", {});
    expect(reply.ok).toBe(false);
    expect(reply.raw).toBe("");
  });

  it("never throws - a network error resolves to ok:false", async () => {
    mockFetchOnce(() => {
      throw new Error("ECONNREFUSED");
    });
    const reply = await generateJson("p", {});
    expect(reply.ok).toBe(false);
  });
});

describe("generate", () => {
  it("returns sanitized text on success", async () => {
    mockFetchOnce(() => ({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "Salom dunyo" } }],
        usage: { completion_tokens: 3 },
      }),
    }));
    const reply = await generate("hi");
    expect(reply.ok).toBe(true);
    expect(reply.text).toBe("Salom dunyo");
    expect(reply.tokens).toBe(3);
  });
});
