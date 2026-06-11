// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { revalidatePath } from "next/cache";

const YEAR = new Date().toISOString().slice(0, 4);

const ASA = `! ASA 9.16(4)
hostname FW-CORE-01`;

// AI analyzer result — 4 gaps (mirrors the old regex output for the test contract).
function makeAnalysis() {
  return {
    device: {
      vendor: "cisco_asa",
      hostname: "FW-CORE-01",
      model: "Cisco ASA",
      firmware: "9.16(4)",
    },
    summary: "Toʻrtta kamchilik aniqlandi.",
    overallRisk: "critical",
    gaps: [
      {
        line: 5,
        severity: "critical",
        title: "no security-level",
        description: "d",
        cwe: "CWE-1188",
        recommendation: "r",
        evidenceLine: "no security-level",
        risk: "x",
        impact: "y",
      },
      {
        line: 6,
        severity: "critical",
        title: "permit tcp any any",
        description: "d",
        cwe: "CWE-284",
        recommendation: "r",
        evidenceLine: "permit tcp any any",
        risk: "x",
        impact: "y",
      },
      {
        line: 7,
        severity: "high",
        title: "telnet",
        description: "d",
        cwe: "CWE-319",
        recommendation: "r",
        evidenceLine: "telnet",
        risk: "x",
        impact: "y",
      },
      {
        line: 8,
        severity: "medium",
        title: "no logging trap",
        description: "d",
        cwe: "CWE-778",
        recommendation: "r",
        evidenceLine: "no logging trap",
        risk: "x",
        impact: "y",
      },
    ],
  };
}

const { analyzeConfigAI } = vi.hoisted(() => ({ analyzeConfigAI: vi.fn() }));

const h = vi.hoisted(() => ({
  canView: true,
  audit: { id: "AUD-1" } as { id: string } | null,
  task: { auditId: "AUD-1" } as { auditId: string } | null,
  upload: null as null | {
    id: string;
    filename: string;
    content: string;
    auditId: string;
    taskId: string;
  },
  ai: null as null | { output: string; ok: boolean },
  findings: [] as { id: string }[],
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/audit-access", () => ({ isAuditMember: vi.fn(async () => true) }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u6", role: "lead", name: "" })),
}));
vi.mock("@/lib/rbac", () => ({ canView: vi.fn(() => h.canView) }));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => h.canView) }));
vi.mock("@/lib/analysis/config", () => ({ analyzeConfigAI }));
vi.mock("@/lib/ai/ollama", () => ({ getOllamaConfig: () => ({ model: "qwen3-coder:30b" }) }));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    audit: { findUnique: vi.fn(async () => h.audit), update: vi.fn(async () => ({})) },
    task: { findUnique: vi.fn(async () => h.task) },
    configUpload: {
      create: vi.fn(async (args: { data: Record<string, unknown> }) => ({
        id: "cu-1",
        ...args.data,
      })),
      findUnique: vi.fn(async () => h.upload),
      update: vi.fn(async () => ({})),
    },
    analyzedDevice: { create: vi.fn(async () => ({})), updateMany: vi.fn(async () => ({})) },
    aiAnalysisResult: { findFirst: vi.fn(async () => h.ai), create: vi.fn(async () => ({})) },
    finding: { create: vi.fn(async () => ({})), findMany: vi.fn(async () => h.findings) },
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

import { uploadConfig, reanalyzeConfig, createConfigDrafts } from "./config";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

const validUpload = { filename: "fw-core-01.cfg", content: ASA, auditId: "AUD-1", taskId: "T-1" };

beforeEach(() => {
  vi.clearAllMocks();
  h.canView = true;
  h.audit = { id: "AUD-1" };
  h.task = { auditId: "AUD-1" };
  h.upload = null;
  h.ai = null;
  h.findings = [];
  analyzeConfigAI.mockResolvedValue({
    ok: true,
    analysis: makeAnalysis(),
    raw: JSON.stringify(makeAnalysis()),
    tokens: 100,
    latencyMs: 10,
  });
});

describe("uploadConfig", () => {
  it("runs the AI analyzer, persists the upload + device + analysis, logs and credits the KPI", async () => {
    const res = await uploadConfig(validUpload);
    expect(res).toMatchObject({ ok: true, uploadId: "cu-1", vendor: "cisco_asa", gapCount: 4 });
    expect(mockPrisma.configUpload.create).toHaveBeenCalledOnce();
    expect(mockPrisma.analyzedDevice.create).toHaveBeenCalledOnce();
    expect(mockPrisma.aiAnalysisResult.create).toHaveBeenCalledOnce();
    const kpiCodes = mockPrisma.kpiEvent.create.mock.calls.map(
      (c: [{ data: { ruleCode: string } }]) => c[0].data.ruleCode,
    );
    expect(kpiCodes).toContain("config_analysis");
    const logActions = mockPrisma.auditLog.create.mock.calls.map(
      (c: [{ data: { action: string } }]) => c[0].data.action,
    );
    expect(logActions).toContain("config.upload");
    expect(revalidatePath).toHaveBeenCalledWith("/analysis/config");
  });

  it("fails with ai_unavailable and persists nothing when the model is unreachable", async () => {
    analyzeConfigAI.mockResolvedValue({ ok: false, raw: "", tokens: 0, latencyMs: 0 });
    expect(await uploadConfig(validUpload)).toEqual({ ok: false, error: "ai_unavailable" });
    expect(mockPrisma.configUpload.create).not.toHaveBeenCalled();
  });

  it("forbids a role without config access", async () => {
    h.canView = false;
    expect(await uploadConfig(validUpload)).toEqual({ ok: false, error: "forbidden" });
  });

  it("rejects a file over the size limit", async () => {
    const big = "x".repeat(2 * 1024 * 1024 + 1);
    expect(await uploadConfig({ ...validUpload, content: big })).toEqual({
      ok: false,
      error: "too_large",
    });
  });

  it("rejects a task that belongs to another audit", async () => {
    h.task = { auditId: "AUD-OTHER" };
    expect(await uploadConfig(validUpload)).toEqual({ ok: false, error: "task_mismatch" });
  });

  it("rejects invalid input", async () => {
    expect(await uploadConfig({ ...validUpload, filename: "" })).toEqual({
      ok: false,
      error: "invalid",
    });
  });
});

describe("reanalyzeConfig", () => {
  beforeEach(() => {
    h.upload = {
      id: "cu-1",
      filename: "fw-core-01.cfg",
      content: ASA,
      auditId: "AUD-1",
      taskId: "T-1",
    };
  });

  it("re-runs the analyzer, refreshes aggregates and records the result", async () => {
    const res = await reanalyzeConfig({ uploadId: "cu-1" });
    expect(res.ok).toBe(true);
    expect(res.analysis?.gaps).toHaveLength(4);
    expect(mockPrisma.configUpload.update).toHaveBeenCalledOnce();
    expect(mockPrisma.analyzedDevice.updateMany).toHaveBeenCalledOnce();
    expect(mockPrisma.aiAnalysisResult.create).toHaveBeenCalledOnce();
    const logActions = mockPrisma.auditLog.create.mock.calls.map(
      (c: [{ data: { action: string } }]) => c[0].data.action,
    );
    expect(logActions).toContain("config.reanalyze");
  });

  it("fails with ai_unavailable when the model is down", async () => {
    analyzeConfigAI.mockResolvedValue({ ok: false, raw: "", tokens: 0, latencyMs: 0 });
    expect(await reanalyzeConfig({ uploadId: "cu-1" })).toEqual({
      ok: false,
      error: "ai_unavailable",
    });
  });
});

describe("createConfigDrafts", () => {
  beforeEach(() => {
    h.upload = {
      id: "cu-1",
      filename: "fw-core-01.cfg",
      content: ASA,
      auditId: "AUD-1",
      taskId: "T-1",
    };
    h.ai = { output: JSON.stringify(makeAnalysis()), ok: true };
  });

  it("materializes a draft finding per persisted gap and logs it", async () => {
    const res = await createConfigDrafts({ uploadId: "cu-1" });
    expect(res.ok).toBe(true);
    expect(res.ids).toHaveLength(4);
    expect(res.ids?.[0]).toBe(`F-${YEAR}-0001`);
    expect(mockPrisma.finding.create).toHaveBeenCalledTimes(4);
    const logActions = mockPrisma.auditLog.create.mock.calls.map(
      (c: [{ data: { action: string } }]) => c[0].data.action,
    );
    expect(logActions).toContain("config.create_drafts");
    expect(revalidatePath).toHaveBeenCalledWith("/findings");
  });

  it("honors a gapIndices subset", async () => {
    const res = await createConfigDrafts({ uploadId: "cu-1", gapIndices: [0, 2] });
    expect(res.ids).toHaveLength(2);
    expect(mockPrisma.finding.create).toHaveBeenCalledTimes(2);
  });

  it("returns no_analysis when the upload has no stored AI result", async () => {
    h.ai = null;
    expect(await createConfigDrafts({ uploadId: "cu-1" })).toEqual({
      ok: false,
      error: "no_analysis",
    });
  });

  it("returns not_found for an unknown upload", async () => {
    h.upload = null;
    expect(await createConfigDrafts({ uploadId: "nope" })).toEqual({
      ok: false,
      error: "not_found",
    });
  });

  it("forbids a role without config access", async () => {
    h.canView = false;
    expect(await createConfigDrafts({ uploadId: "cu-1" })).toEqual({
      ok: false,
      error: "forbidden",
    });
  });
});
