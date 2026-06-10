// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  auditCount: vi.fn(),
  taskCount: vi.fn(),
  findingCount: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    audit: { count: h.auditCount },
    task: { count: h.taskCount },
    finding: { count: h.findingCount },
  },
}));

import { getSidebarCounts } from "./nav-counts";

beforeEach(() => {
  vi.clearAllMocks();
  h.auditCount.mockResolvedValue(8);
  h.taskCount.mockResolvedValue(4);
  h.findingCount.mockResolvedValue(12);
});

describe("getSidebarCounts", () => {
  it("derives sidebar badges from backend counts", async () => {
    await expect(getSidebarCounts("u6")).resolves.toEqual({
      audits: 8,
      tasks: 4,
      findings: 12,
    });

    expect(h.auditCount).toHaveBeenCalledWith();
    expect(h.taskCount).toHaveBeenCalledWith({ where: { assigneeId: "u6" } });
    expect(h.findingCount).toHaveBeenCalledWith();
  });
});
