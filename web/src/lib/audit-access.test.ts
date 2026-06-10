// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  canManagePermission: false,
  audit: { leaderId: "u9", members: [] as { userId: string }[] } as
    | { leaderId: string; members: { userId: string }[] }
    | null,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { audit: { findUnique: vi.fn(async () => h.audit) } },
}));
vi.mock("@/lib/rbac.server", () => ({
  requirePermission: vi.fn(async () => h.canManagePermission),
}));

import { isAuditMember, canManageEvidence } from "./audit-access";

beforeEach(() => {
  h.canManagePermission = false;
  h.audit = { leaderId: "u9", members: [] };
});

describe("isAuditMember", () => {
  it("is true for the leader", async () => {
    expect(await isAuditMember("AUD-1", "u9")).toBe(true);
  });
  it("is true for a member", async () => {
    h.audit = { leaderId: "u9", members: [{ userId: "u3" }] };
    expect(await isAuditMember("AUD-1", "u3")).toBe(true);
  });
  it("is false for a non-member", async () => {
    expect(await isAuditMember("AUD-1", "u5")).toBe(false);
  });
  it("is false for a missing audit", async () => {
    h.audit = null;
    expect(await isAuditMember("AUD-x", "u9")).toBe(false);
  });
});

describe("canManageEvidence", () => {
  it("admits an admin permission holder without membership", async () => {
    h.canManagePermission = true;
    expect(await canManageEvidence("AUD-1", "u5")).toBe(true);
  });
  it("admits a member (non-admin role)", async () => {
    h.audit = { leaderId: "u9", members: [{ userId: "u3" }] };
    expect(await canManageEvidence("AUD-1", "u3")).toBe(true);
  });
  it("rejects a non-member without admin permission", async () => {
    expect(await canManageEvidence("AUD-1", "u5")).toBe(false);
  });
});
