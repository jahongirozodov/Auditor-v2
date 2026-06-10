// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { revalidatePath } from "next/cache";

const { analyzeAuditAI } = vi.hoisted(() => ({ analyzeAuditAI: vi.fn() }));
const h = vi.hoisted(() => ({ canView: true }));

const ANALYSIS = {
  executiveSummary: "x",
  overallRisk: "high",
  topRisks: [{ title: "a", severity: "high", why: "w", recommendation: "r" }],
  remediationPlan: [],
  kpiNote: "k",
};

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u6", role: "head", name: "" })),
}));
vi.mock("@/lib/rbac", () => ({ canView: vi.fn(() => h.canView) }));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => h.canView) }));
vi.mock("@/lib/ai/ollama", () => ({ getOllamaConfig: () => ({ model: "qwen3-coder:30b" }) }));
vi.mock("@/lib/analysis/audit/ai", () => ({ analyzeAuditAI }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    auditAiAnalysis: { create: vi.fn(async () => ({})) },
    auditLog: { create: vi.fn(async () => ({})) },
  },
}));

import { analyzeAudit } from "./audit-ai";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

beforeEach(() => {
  vi.clearAllMocks();
  h.canView = true;
  analyzeAuditAI.mockResolvedValue({ ok: true, analysis: ANALYSIS, raw: JSON.stringify(ANALYSIS), tokens: 10, latencyMs: 5 });
});

describe("analyzeAudit", () => {
  it("runs the analysis, persists it and logs it", async () => {
    const res = await analyzeAudit({ auditId: "AUD-1" });
    expect(res).toMatchObject({ ok: true });
    expect(res.analysis?.overallRisk).toBe("high");
    expect(mockPrisma.auditAiAnalysis.create).toHaveBeenCalledOnce();
    const logActions = mockPrisma.auditLog.create.mock.calls.map((c: [{ data: { action: string } }]) => c[0].data.action);
    expect(logActions).toContain("audit.ai_analyze");
    expect(revalidatePath).toHaveBeenCalledWith("/audits/AUD-1");
  });

  it("returns ai_unavailable (persists nothing) when the analyzer fails", async () => {
    analyzeAuditAI.mockResolvedValue({ ok: false, reason: "ai_unavailable", raw: "", tokens: 0, latencyMs: 0 });
    expect(await analyzeAudit({ auditId: "AUD-1" })).toEqual({ ok: false, error: "ai_unavailable" });
    expect(mockPrisma.auditAiAnalysis.create).not.toHaveBeenCalled();
  });

  it("surfaces no_data (persists nothing) for an empty audit", async () => {
    analyzeAuditAI.mockResolvedValue({ ok: false, reason: "no_data", raw: "", tokens: 0, latencyMs: 0 });
    expect(await analyzeAudit({ auditId: "AUD-1" })).toEqual({ ok: false, error: "no_data" });
    expect(mockPrisma.auditAiAnalysis.create).not.toHaveBeenCalled();
  });

  it("forbids a role without AI access", async () => {
    h.canView = false;
    expect(await analyzeAudit({ auditId: "AUD-1" })).toEqual({ ok: false, error: "forbidden" });
  });
});
