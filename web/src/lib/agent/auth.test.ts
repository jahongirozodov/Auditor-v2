// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { AgentClaims } from "./jwt";

const h = vi.hoisted(() => ({
  claims: null as AgentClaims | null,
  token: null as null | { status: string; auditId: string; userId: string },
}));

vi.mock("./jwt", () => ({ verifyAgentJwt: vi.fn(async () => h.claims) }));
vi.mock("@/lib/prisma", () => ({
  prisma: { auditToken: { findUnique: vi.fn(async () => h.token) } },
}));

import { requireAgent } from "./auth";

const reqWith = (auth?: string) =>
  new Request("http://x/api", { headers: auth ? { authorization: auth } : {} });

beforeEach(() => {
  h.claims = { sub: "u6", auditId: "AUD-1", tokenId: "tk_x" };
  h.token = { status: "active", auditId: "AUD-1", userId: "u6" };
});

describe("requireAgent", () => {
  it("accepts a valid bearer with an active matching token", async () => {
    const res = await requireAgent(reqWith("Bearer good.jwt"));
    expect(res).toEqual({
      ok: true,
      identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" },
    });
  });

  it("401s when the header is missing", async () => {
    expect(await requireAgent(reqWith())).toMatchObject({ ok: false, status: 401 });
  });

  it("401s on an unverifiable jwt", async () => {
    h.claims = null;
    expect(await requireAgent(reqWith("Bearer bad"))).toMatchObject({ ok: false, status: 401 });
  });

  it("403s a login-only token (no audit scope)", async () => {
    h.claims = { sub: "u6" };
    expect(await requireAgent(reqWith("Bearer login.only"))).toMatchObject({
      ok: false,
      status: 403,
      error: "audit_scope_required",
    });
  });

  it("403s a revoked/inactive backing token", async () => {
    h.token = { status: "revoked", auditId: "AUD-1", userId: "u6" };
    expect(await requireAgent(reqWith("Bearer good.jwt"))).toMatchObject({
      ok: false,
      status: 403,
      error: "token_inactive",
    });
  });

  it("403s when JWT claims drift from the DB row", async () => {
    h.token = { status: "active", auditId: "AUD-2", userId: "u6" };
    expect(await requireAgent(reqWith("Bearer good.jwt"))).toMatchObject({
      ok: false,
      status: 403,
      error: "token_mismatch",
    });
  });

  it("401s when the token row is gone", async () => {
    h.token = null;
    expect(await requireAgent(reqWith("Bearer good.jwt"))).toMatchObject({
      ok: false,
      status: 401,
      error: "token_not_found",
    });
  });
});
