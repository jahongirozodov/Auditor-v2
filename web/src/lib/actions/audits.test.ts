// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";

const h = vi.hoisted(() => ({
  audit: { status: "group_forming", leaderId: "u3" } as { status: string; leaderId: string },
  codes: [{ code: "AUD-2026-015" }] as { code: string }[],
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u2", role: "head", name: "" })),
}));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    audit: {
      findMany: vi.fn(async () => h.codes),
      findUnique: vi.fn(async () => h.audit),
      create: vi.fn(async () => ({})),
      update: vi.fn(async () => ({})),
    },
    auditMember: {
      createMany: vi.fn(async () => ({})),
      upsert: vi.fn(async () => ({})),
      deleteMany: vi.fn(async () => ({})),
    },
    auditLog: { create: vi.fn(async () => ({})) },
    kpiEvent: { create: vi.fn(async () => ({})) },
    kpiUser: { upsert: vi.fn(async () => ({})) },
    $transaction: vi.fn(),
  };
  prisma.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === "function"
      ? (arg as (tx: typeof prisma) => unknown)(prisma)
      : Promise.all(arg as unknown[]),
  );
  return { prisma };
});

import { addMember, createAudit, promoteLead, removeMember, startProjectDraft } from "./audits";
import { prisma } from "@/lib/prisma";
// kpiEvent/kpiUser land with the schema migration; cast until `prisma db push` regenerates the client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

const validCreate = {
  title: "Yangi audit nomi",
  type: "Kompleks audit",
  orgId: "o1",
  startDate: "2026-06-01",
  endDate: "2026-07-01",
  leaderId: "u3",
  memberIds: ["u6"],
};

beforeEach(() => {
  vi.clearAllMocks();
  h.audit = { status: "group_forming", leaderId: "u3" };
  h.codes = [{ code: "AUD-2026-015" }];
});

describe("createAudit", () => {
  it("creates with the next code and revalidates", async () => {
    const res = await createAudit(validCreate);
    expect(res).toEqual({ ok: true, id: "AUD-2026-016" });
    expect(revalidatePath).toHaveBeenCalledWith("/audits");
  });
  it("forbids a t1", async () => {
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "t1", name: "" });
    expect(await createAudit(validCreate)).toEqual({ ok: false, error: "forbidden" });
  });
  it("rejects end before start", async () => {
    expect(await createAudit({ ...validCreate, endDate: "2026-05-01" })).toEqual({
      ok: false,
      error: "bad_dates",
    });
  });
});

describe("team edits", () => {
  it("adds a member (head, group_forming)", async () => {
    expect(await addMember({ auditId: "AUD-1", userId: "u6" })).toEqual({ ok: true });
  });
  it("refuses to remove the group lead", async () => {
    expect(await removeMember({ auditId: "AUD-1", userId: "u3" })).toEqual({
      ok: false,
      error: "cannot_remove_lead",
    });
  });
  it("promotes a member to lead", async () => {
    expect(await promoteLead({ auditId: "AUD-1", userId: "u6" })).toEqual({ ok: true });
  });
  it("blocks team edits once past forming", async () => {
    h.audit = { status: "in_progress", leaderId: "u3" };
    expect(await addMember({ auditId: "AUD-1", userId: "u6" })).toEqual({
      ok: false,
      error: "illegal_status",
    });
  });
});

describe("KPI emission", () => {
  it("createAudit emits act_as_group_lead + audit_participation for the leader", async () => {
    await createAudit(validCreate);
    const calls = mockPrisma.kpiEvent.create.mock.calls as [
      { data: { ruleCode: string; userId: string } },
    ][];
    const codes = calls.map((c) => c[0].data.ruleCode);
    expect(codes).toContain("act_as_group_lead");
    expect(codes).toContain("audit_participation");
    // Both credited to the leader (u3), not the actor (u2/head).
    expect(calls.every((c) => c[0].data.userId === "u3")).toBe(true);
  });

  it("addMember emits audit_participation for the new member", async () => {
    await addMember({ auditId: "AUD-1", userId: "u6" });
    const calls = mockPrisma.kpiEvent.create.mock.calls as [
      { data: { ruleCode: string; userId: string } },
    ][];
    expect(calls.map((c) => c[0].data.ruleCode)).toContain("audit_participation");
    expect(calls.every((c) => c[0].data.userId === "u6")).toBe(true);
  });

  it("removeMember does NOT emit KPI events", async () => {
    await removeMember({ auditId: "AUD-1", userId: "u6" });
    expect(mockPrisma.kpiEvent.create).not.toHaveBeenCalled();
  });
});

describe("startProjectDraft", () => {
  it("moves group_forming → project_draft", async () => {
    expect(await startProjectDraft({ auditId: "AUD-1" })).toEqual({ ok: true });
  });
  it("forbids a t1", async () => {
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "t1", name: "" });
    expect(await startProjectDraft({ auditId: "AUD-1" })).toEqual({
      ok: false,
      error: "forbidden",
    });
  });
  it("rejects when not group_forming", async () => {
    h.audit = { status: "project_draft", leaderId: "u3" };
    expect(await startProjectDraft({ auditId: "AUD-1" })).toEqual({
      ok: false,
      error: "illegal_status",
    });
  });
});
