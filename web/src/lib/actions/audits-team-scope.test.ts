// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  session: { userId: "actor1", role: "chief" as string },
  permission: true,
  audit: { status: "planning", leaderId: "other-user" } as { status: string; leaderId: string } | null,
}));

vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => h.session),
}));
vi.mock("@/lib/rbac.server", () => ({
  requirePermission: vi.fn(async () => h.permission),
}));
vi.mock("@/lib/prisma", () => {
  const txMocks = {
    auditMember: {
      upsert: vi.fn(async () => ({})),
      deleteMany: vi.fn(async () => ({})),
    },
    auditLog: { create: vi.fn(async () => ({})) },
    audit: { update: vi.fn(async () => ({})) },
  };
  return {
    prisma: {
      audit: { findUnique: vi.fn(async () => h.audit), update: vi.fn(async () => ({})) },
      auditMember: {
        upsert: vi.fn(async () => ({})),
        deleteMany: vi.fn(async () => ({})),
      },
      auditLog: { create: vi.fn(async () => ({})) },
      user: { findUnique: vi.fn(async () => ({ id: "u5" })) },
      $transaction: vi.fn(async (ops: unknown) => {
        if (Array.isArray(ops)) {
          return Promise.all(ops);
        }
        return (ops as (tx: unknown) => Promise<unknown>)(txMocks);
      }),
    },
  };
});
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/kpi-engine", () => ({ emitKpiEvent: vi.fn(async () => {}) }));

import { addMember, removeMember, promoteLead } from "./audits";

beforeEach(() => {
  h.session = { userId: "actor1", role: "chief" };
  h.permission = true;
  h.audit = { status: "planning", leaderId: "other-user" };
});

describe("addMember — leadership gate", () => {
  it("returns forbidden when caller is not the leader (chief, not leader)", async () => {
    const result = await addMember({ auditId: "AUD-1", userId: "u5" });
    expect(result).toEqual({ ok: false, error: "forbidden" });
  });
  it("allows when caller IS the leader", async () => {
    h.audit = { status: "planning", leaderId: "actor1" };
    const result = await addMember({ auditId: "AUD-1", userId: "u5" });
    expect(result.ok).toBe(true);
  });
  it("allows when role is super regardless of leaderId", async () => {
    h.session = { userId: "actor1", role: "super" };
    const result = await addMember({ auditId: "AUD-1", userId: "u5" });
    expect(result.ok).toBe(true);
  });
  it("allows when role is head regardless of leaderId", async () => {
    h.session = { userId: "actor1", role: "head" };
    const result = await addMember({ auditId: "AUD-1", userId: "u5" });
    expect(result.ok).toBe(true);
  });
});

describe("removeMember — leadership gate", () => {
  it("returns forbidden when caller is not the leader", async () => {
    h.audit = { status: "planning", leaderId: "other-user" };
    const result = await removeMember({ auditId: "AUD-1", userId: "u5" });
    expect(result).toEqual({ ok: false, error: "forbidden" });
  });
  it("allows when caller IS the leader", async () => {
    h.audit = { status: "planning", leaderId: "actor1" };
    const result = await removeMember({ auditId: "AUD-1", userId: "u5" });
    expect(result.ok).toBe(true);
  });
});

describe("promoteLead — leadership gate", () => {
  it("returns forbidden when caller is not the leader", async () => {
    const result = await promoteLead({ auditId: "AUD-1", userId: "u5" });
    expect(result).toEqual({ ok: false, error: "forbidden" });
  });
  it("allows when role is head", async () => {
    h.session = { userId: "actor1", role: "head" };
    const result = await promoteLead({ auditId: "AUD-1", userId: "u5" });
    expect(result.ok).toBe(true);
  });
});
