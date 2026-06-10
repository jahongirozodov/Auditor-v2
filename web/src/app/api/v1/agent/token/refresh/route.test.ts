// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  auth: { ok: true, identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" } } as
    | { ok: true; identity: { userId: string; auditId: string; tokenId: string } }
    | { ok: false; status: number; error: string },
}));

vi.mock("@/lib/agent/auth", () => ({ requireAgent: vi.fn(async () => h.auth) }));
vi.mock("@/lib/agent/jwt", () => ({ signAgentJwt: vi.fn(async () => "fresh-jwt") }));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    auditToken: { update: vi.fn(async () => ({})) },
    auditTokenUsageLog: { create: vi.fn(async () => ({})) },
    $transaction: vi.fn(async (arg: unknown) => Promise.all(arg as unknown[])),
  };
  return { prisma };
});

import { POST } from "./route";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mock = prisma as any;

const post = () => POST(new Request("http://x/api/v1/agent/token/refresh", { method: "POST" }));

beforeEach(() => {
  vi.clearAllMocks();
  h.auth = { ok: true, identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" } };
});

describe("POST /agent/token/refresh", () => {
  it("re-mints the JWT and stamps lastUsed", async () => {
    const res = await post();
    expect(await res.json()).toEqual({ ok: true, token: "fresh-jwt" });
    expect(mock.auditToken.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "tk_x" } }),
    );
  });

  it("rejects a revoked backing token via requireAgent", async () => {
    h.auth = { ok: false, status: 403, error: "token_inactive" };
    expect((await post()).status).toBe(403);
  });
});
