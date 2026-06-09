// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    audit: {
      findMany: vi.fn(async () => [
        {
          id: "AUD-1",
          code: "AUD-1",
          title: "T",
          orgId: "o1",
          type: "X",
          status: "in_progress",
          stage: 7,
          startDate: "a",
          endDate: "b",
          progress: 50,
          leaderId: "u3",
          lastSync: "s",
          pinned: false,
          findings: { critical: 4, high: 9, medium: 14, low: 7 },
          tasksAgg: { total: 38, done: 22, in_progress: 11, blocked: 2, new: 3 },
          members: [{ userId: "u3" }, { userId: "u4" }],
        },
      ]),
    },
    kpiUser: {
      findMany: vi.fn(async () => [
        {
          userId: "u3",
          audits: 4,
          tasks: 31,
          findings: 14,
          total: 287,
          delta: 18,
          sparkline: [1, 2, 3],
        },
      ]),
    },
  },
}));

import { getAudits } from "./audits";
import { getKpiUsers } from "./kpi";

describe("DAL mapping", () => {
  it("maps audit rows: members join → string[], Json → counts", async () => {
    const [a] = await getAudits();
    expect(a.org).toBe("o1");
    expect(a.leader).toBe("u3");
    expect(a.members).toEqual(["u3", "u4"]);
    expect(a.findings.critical).toBe(4);
    expect(a.tasks.total).toBe(38);
  });

  it("maps kpi rows: userId → user, sparkline Json → number[]", async () => {
    const [k] = await getKpiUsers();
    expect(k.user).toBe("u3");
    expect(k.sparkline).toEqual([1, 2, 3]);
  });
});
