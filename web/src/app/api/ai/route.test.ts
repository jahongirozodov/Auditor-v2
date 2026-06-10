import { describe, it, expect, vi, beforeEach } from "vitest";

const { getSession, generate, getOllamaConfig, isAiEnabled, create } = vi.hoisted(() => ({
  getSession: vi.fn(),
  generate: vi.fn(),
  getOllamaConfig: vi.fn(() => ({ model: "qwen3-coder:30b" })),
  isAiEnabled: vi.fn(() => true),
  create: vi.fn(),
}));

vi.mock("@/lib/session", () => ({ getSession }));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => true) }));
vi.mock("@/lib/prisma", () => ({ prisma: { aiAnalysisResult: { create } } }));
vi.mock("@/lib/ai/ollama", () => ({ generate, getOllamaConfig, isAiEnabled }));

import { POST } from "./route";

function post(body: unknown) {
  return POST(
    new Request("http://localhost/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getSession.mockResolvedValue({ user: { id: "u-1" } });
  isAiEnabled.mockReturnValue(true);
  getOllamaConfig.mockReturnValue({ model: "qwen3-coder:30b" });
  create.mockResolvedValue({});
});

describe("POST /api/ai (chat only)", () => {
  it("rejects an unauthenticated request", async () => {
    getSession.mockResolvedValue(null);
    expect((await post({ scope: "chat", prompt: "x" })).status).toBe(401);
  });

  it("rejects a non-chat scope (config no longer goes through the route)", async () => {
    expect((await post({ scope: "config", prompt: "x" })).status).toBe(400);
  });

  it("returns plain text for chat scope and persists the call", async () => {
    generate.mockResolvedValue({ ok: true, text: "Salom", tokens: 2, latencyMs: 3 });
    const res = await post({ scope: "chat", prompt: "hi" });
    const json = (await res.json()) as { ok: boolean; text?: string };
    expect(json).toMatchObject({ ok: true, text: "Salom" });
    expect(generate).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ scope: "chat", ok: true }) }),
    );
  });

  it("degrades without calling the model when AI is disabled", async () => {
    isAiEnabled.mockReturnValue(false);
    const json = (await (await post({ scope: "chat", prompt: "x" })).json()) as {
      degraded?: boolean;
    };
    expect(json.degraded).toBe(true);
    expect(generate).not.toHaveBeenCalled();
    expect(create).not.toHaveBeenCalled();
  });

  it("degrades when the model is unreachable", async () => {
    generate.mockResolvedValue({ ok: false, text: "", tokens: 0, latencyMs: 1 });
    const json = (await (await post({ scope: "chat", prompt: "x" })).json()) as {
      ok: boolean;
      degraded?: boolean;
    };
    expect(json).toMatchObject({ ok: false, degraded: true });
  });
});
