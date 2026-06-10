// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  auth: { ok: true, identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" } } as
    | { ok: true; identity: { userId: string; auditId: string; tokenId: string } }
    | { ok: false; status: number; error: string },
  tasks: [{ id: "T-1", auditId: "AUD-1" }] as { id: string; auditId: string }[],
  existingKeys: [] as string[],
}));

vi.mock("@/lib/agent/auth", () => ({ requireAgent: vi.fn(async () => h.auth) }));
vi.mock("@/lib/actions/findings", () => ({
  // Echo one id per input so `created` reflects what was passed in.
  materializeFindings: vi.fn(async (_u: string, inputs: unknown[]) =>
    inputs.map((_, i) => `F-2026-${i}`),
  ),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    task: { findMany: vi.fn(async () => h.tasks) },
    finding: { findMany: vi.fn(async () => h.existingKeys.map((k) => ({ idempotencyKey: k }))) },
    auditTokenUsageLog: { create: vi.fn(async () => ({})) },
  },
}));

import { POST } from "./route";
import { materializeFindings } from "@/lib/actions/findings";

const f = (idempotencyKey: string, over: Record<string, unknown> = {}) => ({
  idempotencyKey,
  taskId: "T-1",
  title: "SQL injection",
  severity: "high",
  cvss: 8.1,
  type: "web",
  ...over,
});

const post = (body: unknown) =>
  POST(
    new Request("http://x/api/v1/agent/findings/sync", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  h.auth = { ok: true, identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" } };
  h.tasks = [{ id: "T-1", auditId: "AUD-1" }];
  h.existingKeys = [];
  vi.mocked(materializeFindings).mockClear();
});

describe("POST /agent/findings/sync", () => {
  it("creates fresh findings", async () => {
    const res = await post({ findings: [f("key-aaaaaaaa"), f("key-bbbbbbbb")] });
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, created: 2, skipped: 0 });
    expect(materializeFindings).toHaveBeenCalledWith("u6", expect.any(Array), "agent");
  });

  it("skips an already-synced key (idempotent re-sync)", async () => {
    h.existingKeys = ["key-aaaaaaaa"];
    const res = await post({ findings: [f("key-aaaaaaaa"), f("key-bbbbbbbb")] });
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, created: 1, skipped: 1 });
    // Only the fresh one reaches the create path.
    expect(vi.mocked(materializeFindings).mock.calls[0][1]).toHaveLength(1);
  });

  it("dedups duplicate keys within one batch", async () => {
    const res = await post({ findings: [f("key-aaaaaaaa"), f("key-aaaaaaaa")] });
    const body = await res.json();
    expect(body).toMatchObject({ ok: true, created: 1, skipped: 1 });
  });

  it("rejects a task outside the token's audit (403)", async () => {
    h.tasks = [{ id: "T-1", auditId: "AUD-OTHER" }];
    const res = await post({ findings: [f("key-aaaaaaaa")] });
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ error: "task_scope" });
    expect(materializeFindings).not.toHaveBeenCalled();
  });

  it("400s on invalid body", async () => {
    const res = await post({ findings: [] });
    expect(res.status).toBe(400);
  });

  it("propagates an auth failure", async () => {
    h.auth = { ok: false, status: 401, error: "missing_token" };
    const res = await post({ findings: [f("key-aaaaaaaa")] });
    expect(res.status).toBe(401);
  });
});
