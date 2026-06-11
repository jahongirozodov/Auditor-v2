// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { RoleCode } from "@/lib/types/roles";

const h = vi.hoisted(() => ({
  actor: "u1",
  role: "chief" as RoleCode,
  permission: true,
  isLeader: false,
  audit: { id: "AUD-1" } as { id: string } | null,
  token: { id: "TOK-1", auditId: "AUD-1" } as Record<string, unknown> | null,
}));

vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: h.actor, role: h.role })),
}));
vi.mock("@/lib/rbac.server", () => ({
  requirePermission: vi.fn(async () => h.permission),
}));
vi.mock("@/lib/audit-access", () => ({
  isAuditLeader: vi.fn(async () => h.isLeader),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    audit: { findUnique: vi.fn(async () => h.audit) },
    user: { findUnique: vi.fn(async () => ({ id: "u2" })) },
    auditToken: {
      findUnique: vi.fn(async () => h.token),
      create: vi.fn(async () => ({ id: "TOK-new", token: "tok_xxx" })),
      update: vi.fn(async () => ({})),
    },
    auditLog: { create: vi.fn(async () => ({})) },
    $transaction: vi.fn(async (ops: unknown) =>
      Array.isArray(ops) ? Promise.all(ops) : (ops as (tx: unknown) => Promise<unknown>)({}),
    ),
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { issueToken, revokeToken, rotateToken } from "./tokens";

beforeEach(() => {
  h.isLeader = false;
  h.audit = { id: "AUD-1" };
  h.token = { id: "TOK-1", auditId: "AUD-1" };
});

describe("issueToken — leader gate", () => {
  it("returns forbidden when caller is not audit leader", async () => {
    const r = await issueToken({ auditId: "AUD-1", userId: "u2", expires: "2027-01-01" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
  it("allows when caller is audit leader", async () => {
    h.isLeader = true;
    const r = await issueToken({ auditId: "AUD-1", userId: "u2", expires: "2027-01-01" });
    expect(r.ok).toBe(true);
  });
});

describe("revokeToken — leader gate", () => {
  it("returns forbidden when caller is not audit leader", async () => {
    const r = await revokeToken({ id: "TOK-1" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
  it("allows when caller is audit leader", async () => {
    h.isLeader = true;
    const r = await revokeToken({ id: "TOK-1" });
    expect(r.ok).toBe(true);
  });
});

describe("rotateToken — leader gate", () => {
  it("returns forbidden when caller is not audit leader", async () => {
    const r = await rotateToken({ id: "TOK-1" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
  it("allows when caller is audit leader", async () => {
    h.isLeader = true;
    const r = await rotateToken({ id: "TOK-1" });
    expect(r.ok).toBe(true);
  });
});
