// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  report: {
    id: "R-1",
    title: "Yakuniy hisobot",
    auditId: "AUD-1",
    type: "Audit hisoboti",
    status: "draft" as string,
    approvalStage: null as string | null,
    generated: "—",
    size: "—",
    format: ["PDF"],
    summary: null as string | null,
    authorId: "u1",
  },
  aiEnabled: true,
  reply: { ok: true, text: "Executive summary matni.", tokens: 12, latencyMs: 40 },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u1", role: "lead", name: "" })),
}));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => true) }));
vi.mock("@/lib/ai/ollama", () => ({
  isAiEnabled: vi.fn(() => h.aiEnabled),
  getOllamaConfig: vi.fn(() => ({ model: "test-model" })),
  generate: vi.fn(async () => h.reply),
}));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    report: {
      findUnique: vi.fn(async () => h.report),
      create: vi.fn(async () => ({})),
      update: vi.fn(async () => ({})),
      delete: vi.fn(async () => ({})),
    },
    audit: { findUnique: vi.fn(async () => ({ code: "AUD-001", title: "Test" })) },
    finding: { findMany: vi.fn(async () => [{ title: "SQLi", severity: "high" }]) },
    approvalEvent: { create: vi.fn(async () => ({})) },
    auditLog: { create: vi.fn(async () => ({})) },
    aiAnalysisResult: { create: vi.fn(async () => ({})) },
    $transaction: vi.fn(),
  };
  prisma.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === "function" ? (arg as (tx: typeof prisma) => unknown)(prisma) : undefined,
  );
  return { prisma };
});

import { requireSession } from "@/lib/session";
import { isAiEnabled } from "@/lib/ai/ollama";
import { prisma } from "@/lib/prisma";
import { reportApproval, regenerateReportSummary } from "./reports";

const asSession = (role: string, userId = "u1") =>
  vi.mocked(requireSession).mockResolvedValue({ userId, role, name: "" } as never);

beforeEach(() => {
  vi.clearAllMocks();
  h.report.status = "draft";
  h.report.approvalStage = null;
  h.report.authorId = "u1";
  h.aiEnabled = true;
  h.reply = { ok: true, text: "Executive summary matni.", tokens: 12, latencyMs: 40 };
  asSession("lead");
});

describe("reportApproval", () => {
  it("author submits a draft → review at group_lead", async () => {
    asSession("t1"); // not an approver, but is the author
    h.report.authorId = "u1";
    const res = await reportApproval({ reportId: "R-1", action: "submit" });
    expect(res.ok).toBe(true);
    expect(prisma.report.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "review", approvalStage: "group_lead" } }),
    );
    expect(prisma.approvalEvent.create).toHaveBeenCalled();
  });

  it("rejects submit from a non-author with no approver rights", async () => {
    asSession("t1", "someone-else");
    h.report.authorId = "u1";
    const res = await reportApproval({ reportId: "R-1", action: "submit" });
    expect(res).toEqual({ ok: false, error: "forbidden" });
  });

  it("rejects approve while still a draft (illegal transition)", async () => {
    const res = await reportApproval({ reportId: "R-1", action: "approve" });
    expect(res).toEqual({ ok: false, error: "illegal_transition" });
  });

  it("approve at group_lead advances to head", async () => {
    h.report.status = "review";
    h.report.approvalStage = "group_lead";
    const res = await reportApproval({ reportId: "R-1", action: "approve" });
    expect(res.ok).toBe(true);
    expect(prisma.report.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "review", approvalStage: "head" } }),
    );
  });

  it("final approve at dept → approved", async () => {
    asSession("super");
    h.report.status = "review";
    h.report.approvalStage = "dept";
    const res = await reportApproval({ reportId: "R-1", action: "approve" });
    expect(res.ok).toBe(true);
    expect(prisma.report.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "approved", approvalStage: null } }),
    );
  });

  it("gates approve by role (lead cannot act at head)", async () => {
    h.report.status = "review";
    h.report.approvalStage = "head";
    const res = await reportApproval({ reportId: "R-1", action: "approve" });
    expect(res).toEqual({ ok: false, error: "forbidden" });
  });

  it("return requires a comment", async () => {
    h.report.status = "review";
    h.report.approvalStage = "group_lead";
    const res = await reportApproval({ reportId: "R-1", action: "return" });
    expect(res).toEqual({ ok: false, error: "comment_required" });
  });

  it("return with comment → returned", async () => {
    h.report.status = "review";
    h.report.approvalStage = "group_lead";
    const res = await reportApproval({ reportId: "R-1", action: "return", comment: "tuzating" });
    expect(res.ok).toBe(true);
    expect(prisma.report.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { status: "returned", approvalStage: null } }),
    );
  });

  it("returns not_found for a missing report", async () => {
    vi.mocked(prisma.report.findUnique).mockResolvedValueOnce(null as never);
    const res = await reportApproval({ reportId: "R-x", action: "submit" });
    expect(res).toEqual({ ok: false, error: "not_found" });
  });
});

describe("regenerateReportSummary", () => {
  it("writes the AI summary and logs the call on success", async () => {
    const res = await regenerateReportSummary("R-1");
    expect(res.ok).toBe(true);
    expect(prisma.report.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "R-1" },
        data: expect.objectContaining({ summary: "Executive summary matni." }),
      }),
    );
    expect(prisma.aiAnalysisResult.create).toHaveBeenCalled();
  });

  it("degrades when AI is disabled (no summary written)", async () => {
    vi.mocked(isAiEnabled).mockReturnValueOnce(false);
    const res = await regenerateReportSummary("R-1");
    expect(res).toEqual({ ok: false, error: "degraded" });
    expect(prisma.report.update).not.toHaveBeenCalled();
  });

  it("degrades and logs when Ollama is unreachable", async () => {
    h.reply = { ok: false, text: "", tokens: 0, latencyMs: 10 };
    const res = await regenerateReportSummary("R-1");
    expect(res).toEqual({ ok: false, error: "degraded" });
    expect(prisma.aiAnalysisResult.create).toHaveBeenCalled();
    expect(prisma.report.update).not.toHaveBeenCalled();
  });
});
