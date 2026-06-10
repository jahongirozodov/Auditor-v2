// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  canManage: true,
  audit: { id: "AUD-1" } as { id: string } | null,
  user: { id: "u6" } as { id: string } | null,
  token: null as null | Record<string, unknown>,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u1", role: "super", name: "" })),
}));
vi.mock("@/lib/rbac", () => ({ canManage: vi.fn(() => h.canManage) }));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => h.canManage) }));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    audit: { findUnique: vi.fn(async () => h.audit) },
    user: { findUnique: vi.fn(async () => h.user) },
    auditToken: {
      create: vi.fn(async () => ({})),
      update: vi.fn(async () => ({})),
      findUnique: vi.fn(async () => h.token),
    },
    auditLog: { create: vi.fn(async () => ({})) },
    $transaction: vi.fn(),
  };
  prisma.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === "function"
      ? (arg as (tx: typeof prisma) => unknown)(prisma)
      : Promise.all(arg as unknown[]),
  );
  return { prisma };
});

import { issueToken, revokeToken, rotateToken } from "./tokens";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mock = prisma as any;

const validIssue = { auditId: "AUD-1", userId: "u6", expires: "2026-12-31 18:00", device: "PC-1" };
const FULL_TOKEN = {
  id: "tk_old",
  auditId: "AUD-1",
  userId: "u6",
  device: "PC-1",
  hostname: "h",
  os: "o",
  agent: "a",
  ip: "1.1.1.1",
  issued: "x",
  expires: "y",
  status: "active",
  lastUsed: "z",
  tasks: 3,
};

beforeEach(() => {
  vi.clearAllMocks();
  h.canManage = true;
  h.audit = { id: "AUD-1" };
  h.user = { id: "u6" };
  h.token = null;
});

describe("issueToken", () => {
  it("creates an active token (tk_ id) + logs token.issue", async () => {
    const res = await issueToken(validIssue);
    expect(res.ok).toBe(true);
    expect(res.id).toMatch(/^tk_/);
    expect(mock.auditToken.create).toHaveBeenCalledOnce();
    const logActions = mock.auditLog.create.mock.calls.map(
      (c: [{ data: { action: string } }]) => c[0].data.action,
    );
    expect(logActions).toContain("token.issue");
  });

  it("forbids a non-manager", async () => {
    h.canManage = false;
    expect(await issueToken(validIssue)).toEqual({ ok: false, error: "forbidden" });
  });

  it("rejects a missing audit", async () => {
    h.audit = null;
    expect(await issueToken(validIssue)).toEqual({ ok: false, error: "not_found" });
  });

  it("rejects invalid input", async () => {
    expect(await issueToken({ ...validIssue, auditId: "" })).toEqual({
      ok: false,
      error: "invalid",
    });
  });
});

describe("revokeToken", () => {
  it("sets status revoked + logs token.revoke", async () => {
    h.token = { id: "tk_x" };
    const res = await revokeToken({ id: "tk_x" });
    expect(res).toEqual({ ok: true });
    expect(mock.auditToken.update).toHaveBeenCalledWith({
      where: { id: "tk_x" },
      data: { status: "revoked" },
    });
  });

  it("returns not_found for an unknown token", async () => {
    h.token = null;
    expect(await revokeToken({ id: "nope" })).toEqual({ ok: false, error: "not_found" });
  });

  it("forbids a non-manager", async () => {
    h.canManage = false;
    expect(await revokeToken({ id: "tk_x" })).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("rotateToken", () => {
  it("revokes the old token and issues a new one", async () => {
    h.token = FULL_TOKEN;
    const res = await rotateToken({ id: "tk_old" });
    expect(res.ok).toBe(true);
    expect(res.id).toMatch(/^tk_/);
    expect(res.id).not.toBe("tk_old");
    expect(mock.auditToken.update).toHaveBeenCalledWith({
      where: { id: "tk_old" },
      data: { status: "revoked" },
    });
    expect(mock.auditToken.create).toHaveBeenCalledOnce();
  });

  it("returns not_found for an unknown token", async () => {
    h.token = null;
    expect(await rotateToken({ id: "nope" })).toEqual({ ok: false, error: "not_found" });
  });
});
