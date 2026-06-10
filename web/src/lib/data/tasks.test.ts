// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  taskRows: [
    {
      id: "T-1",
      auditId: "AUD-1",
      title: "Task",
      type: "Konfiguratsiya",
      priority: "Yuqori",
      status: "in_progress",
      due: "2026-06-01",
      assigneeId: "u6",
      findings: 0,
      files: 0,
      kpi: 5,
    },
  ],
  auditRows: [
    {
      id: "AUD-1",
      code: "AUD-1",
      title: "Audit",
      orgId: "o1",
      type: "Kompleks audit",
      status: "in_progress",
      stage: 7,
      startDate: "2026-06-01",
      endDate: "2026-07-01",
      progress: 10,
      leaderId: "u3",
      members: [{ userId: "u3" }, { userId: "u6" }],
      findings: { critical: 0, high: 0, medium: 0, low: 0 },
      tasksAgg: { total: 1, done: 0, in_progress: 1, blocked: 0, new: 0 },
      lastSync: "—",
      pinned: false,
      goal: null,
      methodology: null,
      scope: [],
      tools: [],
    },
  ],
  canAssign: true,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    task: { findMany: vi.fn(async () => h.taskRows), findUnique: vi.fn() },
    audit: { findMany: vi.fn(async () => h.auditRows) },
    taskStatusHistory: { findMany: vi.fn(async () => []) },
  },
}));
vi.mock("@/lib/rbac.server", () => ({ userHasPermission: vi.fn(async () => h.canAssign) }));

import { prisma } from "@/lib/prisma";
import { getCreatableTaskAudits, getMyTasks } from "./tasks";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

beforeEach(() => {
  vi.clearAllMocks();
  h.canAssign = true;
});

describe("tasks data access", () => {
  it("getMyTasks queries only tasks assigned to the user", async () => {
    const tasks = await getMyTasks("u6");
    expect(mockPrisma.task.findMany).toHaveBeenCalledWith({
      where: { assigneeId: "u6" },
      orderBy: { id: "asc" },
    });
    expect(tasks[0].assignee).toBe("u6");
  });

  it("getCreatableTaskAudits limits non-admins to audits they lead", async () => {
    const audits = await getCreatableTaskAudits("u3", "chief");
    expect(mockPrisma.audit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: { in: ["assigning", "in_progress"] }, leaderId: "u3" },
      }),
    );
    expect(audits[0].members).toEqual(["u3", "u6"]);
  });

  it("getCreatableTaskAudits returns no audits without task.assign permission", async () => {
    h.canAssign = false;
    const audits = await getCreatableTaskAudits("u3", "chief");
    expect(audits).toEqual([]);
    expect(mockPrisma.audit.findMany).not.toHaveBeenCalled();
  });

  it("getCreatableTaskAudits lets head/super see all creatable audits", async () => {
    await getCreatableTaskAudits("u2", "head");
    expect(mockPrisma.audit.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: { in: ["assigning", "in_progress"] } },
      }),
    );
  });
});
