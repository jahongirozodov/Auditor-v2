// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRow = {
  id: "AUD-2026-001",
  code: "AUD-2026-001",
  title: "Test Audit",
  orgId: "org1",
  type: "Kompleks",
  status: "in_progress",
  stage: 5,
  startDate: "2026-01-01",
  endDate: "2026-06-01",
  progress: 40,
  leaderId: "u1",
  lastSync: "2026-06-01",
  pinned: false,
  goal: "Maqsad matni",
  methodology: null,
  scope: ["scope1"],
  tools: ["tool1"],
  findings: { critical: 1, high: 2, medium: 3, low: 4 },
  tasksAgg: { total: 10, done: 3, in_progress: 4, blocked: 1, new: 2 },
  members: [{ userId: "u1" }, { userId: "u2" }],
};

vi.mock("@/lib/prisma", () => ({
  prisma: {
    audit: {
      findMany: vi.fn(async () => [mockRow]),
      findUnique: vi.fn(async () => mockRow),
    },
  },
}));

import { getAuditById, getAudits, getAuditsByOrg, getScopedAudits } from "./audits";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mock = prisma as any;

beforeEach(() => {
  vi.clearAllMocks();
  mock.audit.findMany.mockResolvedValue([mockRow]);
  mock.audit.findUnique.mockResolvedValue(mockRow);
});

describe("toAudit mapping (via getAudits)", () => {
  it("maps orgId → org, leaderId → leader, members array to flat string[]", async () => {
    const [a] = await getAudits();
    expect(a.org).toBe("org1");
    expect(a.leader).toBe("u1");
    expect(a.members).toEqual(["u1", "u2"]);
  });

  it("converts null methodology to undefined, preserves non-null goal", async () => {
    const [a] = await getAudits();
    expect(a.methodology).toBeUndefined();
    expect(a.goal).toBe("Maqsad matni");
  });
});

describe("getAudits", () => {
  it("queries with include members and orderBy code desc", async () => {
    await getAudits();
    expect(mock.audit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: { members: true },
        orderBy: { code: "desc" },
      }),
    );
  });
});

describe("getAuditById", () => {
  it("returns mapped audit when found", async () => {
    const a = await getAuditById("AUD-2026-001");
    expect(a).toBeDefined();
    expect(a!.id).toBe("AUD-2026-001");
    expect(mock.audit.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: "AUD-2026-001" } }),
    );
  });

  it("returns undefined when record does not exist", async () => {
    mock.audit.findUnique.mockResolvedValueOnce(null);
    const a = await getAuditById("nonexistent");
    expect(a).toBeUndefined();
  });
});

describe("getAuditsByOrg", () => {
  it("passes orgId in the where clause", async () => {
    await getAuditsByOrg("org42");
    expect(mock.audit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { orgId: "org42" } }),
    );
  });
});

describe("getScopedAudits — RBAC branching", () => {
  it("lead: queries by leaderId only", async () => {
    await getScopedAudits("u99", "lead");
    expect(mock.audit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { leaderId: "u99" } }),
    );
  });

  it("t1: queries audits where user is a member", async () => {
    await getScopedAudits("u99", "t1");
    expect(mock.audit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { members: { some: { userId: "u99" } } } }),
    );
  });

  it("head: queries audits where user is a member (documents current behaviour)", async () => {
    await getScopedAudits("u99", "head");
    expect(mock.audit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { members: { some: { userId: "u99" } } } }),
    );
  });
});
