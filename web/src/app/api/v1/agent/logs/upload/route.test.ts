// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  auth: { ok: true, identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" } } as
    | { ok: true; identity: { userId: string; auditId: string; tokenId: string } }
    | { ok: false; status: number; error: string },
}));

vi.mock("@/lib/agent/auth", () => ({ requireAgent: vi.fn(async () => h.auth) }));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    auditLog: { createMany: vi.fn(async () => ({ count: 2 })) },
    auditTokenUsageLog: { create: vi.fn(async () => ({})) },
  };
  return { prisma };
});

import { POST } from "./route";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mock = prisma as any;

const post = (body: unknown) =>
  POST(
    new Request("http://x/api/v1/agent/logs/upload", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  );

beforeEach(() => {
  vi.clearAllMocks();
  h.auth = { ok: true, identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" } };
});

describe("POST /agent/logs/upload", () => {
  it("stores each line as an append-only AuditLog row", async () => {
    const res = await post({
      logs: [
        { ts: "10:00:00", level: "INFO", message: "started" },
        { ts: "10:00:01", level: "WARN", message: "offline" },
      ],
    });
    expect(await res.json()).toMatchObject({ ok: true, stored: 2 });
    const rows = mock.auditLog.createMany.mock.calls[0][0].data;
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ action: "agent.log", userId: "u6" });
    expect(rows[1].level).toBe("warn"); // WARN → warn
  });

  it("400s on an empty batch", async () => {
    expect((await post({ logs: [] })).status).toBe(400);
  });
});
