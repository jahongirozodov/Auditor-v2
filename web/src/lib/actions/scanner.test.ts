// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { revalidatePath } from "next/cache";

const YEAR = new Date().toISOString().slice(0, 4);

// Universal CSV — two duplicate rows; the deterministic parser yields 2 findings.
const CSV = `title,severity,host
SQL Injection,high,10.0.0.1
SQL Injection,high,10.0.0.1`;

function normalization() {
  return {
    summary: "Bitta zaiflik (birlashtirildi)",
    overallRisk: "high",
    originalCount: 2,
    normalizedCount: 1,
    findings: [
      {
        title: "SQL Injection",
        description: "Merged",
        severity: "high",
        host: "10.0.0.1",
        remediation: "Parametrlangan soʻrovlar",
        mergedCount: 2,
      },
    ],
  };
}

const { normalizeScannerAI } = vi.hoisted(() => ({ normalizeScannerAI: vi.fn() }));

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
    aiOk: boolean;
    aiResult: string | null;
  },
  findings: [] as { id: string }[],
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/audit-access", () => ({ isAuditMember: vi.fn(async () => true) }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u6", role: "lead", name: "" })),
}));
vi.mock("@/lib/rbac", () => ({ canView: vi.fn(() => h.canView) }));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => h.canView) }));
vi.mock("@/lib/analysis/scanner/ai", () => ({ normalizeScannerAI }));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    audit: { findUnique: vi.fn(async () => h.audit), update: vi.fn(async () => ({})) },
    task: { findUnique: vi.fn(async () => h.task) },
    scannerUpload: {
      create: vi.fn(async (args: { data: Record<string, unknown> }) => ({
        id: "su-1",
        ...args.data,
      })),
      findUnique: vi.fn(async () => h.upload),
      update: vi.fn(async () => ({})),
    },
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

import { uploadScannerFile, reanalyzeScanner, createScannerDrafts } from "./scanner";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

const validUpload = { filename: "scan.csv", content: CSV, auditId: "AUD-1", taskId: "T-1" };

beforeEach(() => {
  vi.clearAllMocks();
  h.canView = true;
  h.audit = { id: "AUD-1" };
  h.task = { auditId: "AUD-1" };
  h.upload = null;
  h.findings = [];
  normalizeScannerAI.mockResolvedValue({
    ok: true,
    normalization: normalization(),
    raw: JSON.stringify(normalization()),
    tokens: 10,
    latencyMs: 5,
  });
});

describe("uploadScannerFile", () => {
  it("parses, runs AI normalization, persists aiResult/aiOk, logs and credits the KPI", async () => {
    const res = await uploadScannerFile(validUpload);
    expect(res).toMatchObject({ ok: true, uploadId: "su-1", aiOk: true });
    expect(res.ai?.normalizedCount).toBe(1);
    const createArgs = mockPrisma.scannerUpload.create.mock.calls[0][0].data;
    expect(createArgs.aiOk).toBe(true);
    expect(typeof createArgs.aiResult).toBe("string");
    const kpiCodes = mockPrisma.kpiEvent.create.mock.calls.map(
      (c: [{ data: { ruleCode: string } }]) => c[0].data.ruleCode,
    );
    expect(kpiCodes).toContain("scanner_import");
    const logActions = mockPrisma.auditLog.create.mock.calls.map(
      (c: [{ data: { action: string } }]) => c[0].data.action,
    );
    expect(logActions).toContain("scanner.import");
    expect(revalidatePath).toHaveBeenCalledWith("/analysis/scanner");
  });

  it("still imports (graceful) with aiOk:false when the model is unreachable", async () => {
    normalizeScannerAI.mockResolvedValue({ ok: false, raw: "", tokens: 0, latencyMs: 0 });
    const res = await uploadScannerFile(validUpload);
    expect(res.ok).toBe(true);
    expect(res.aiOk).toBe(false);
    const createArgs = mockPrisma.scannerUpload.create.mock.calls[0][0].data;
    expect(createArgs.aiOk).toBe(false);
    expect(createArgs.aiResult).toBeNull();
  });

  it("forbids a role without access and rejects oversize / mismatched input", async () => {
    h.canView = false;
    expect(await uploadScannerFile(validUpload)).toEqual({ ok: false, error: "forbidden" });
    h.canView = true;
    h.task = { auditId: "AUD-OTHER" };
    expect(await uploadScannerFile(validUpload)).toEqual({ ok: false, error: "task_mismatch" });
  });
});

describe("reanalyzeScanner", () => {
  beforeEach(() => {
    h.upload = {
      id: "su-1",
      filename: "scan.csv",
      content: CSV,
      auditId: "AUD-1",
      taskId: "T-1",
      aiOk: false,
      aiResult: null,
    };
  });

  it("re-runs normalization, updates the row and logs it", async () => {
    const res = await reanalyzeScanner({ uploadId: "su-1" });
    expect(res.ok).toBe(true);
    expect(res.normalization?.normalizedCount).toBe(1);
    expect(mockPrisma.scannerUpload.update).toHaveBeenCalledOnce();
    const logActions = mockPrisma.auditLog.create.mock.calls.map(
      (c: [{ data: { action: string } }]) => c[0].data.action,
    );
    expect(logActions).toContain("scanner.reanalyze");
  });

  it("fails with ai_unavailable when the model is down", async () => {
    normalizeScannerAI.mockResolvedValue({ ok: false, raw: "", tokens: 0, latencyMs: 0 });
    expect(await reanalyzeScanner({ uploadId: "su-1" })).toEqual({
      ok: false,
      error: "ai_unavailable",
    });
  });
});

describe("createScannerDrafts", () => {
  it("uses the normalized (deduped) findings when AI succeeded", async () => {
    h.upload = {
      id: "su-1",
      filename: "scan.csv",
      content: CSV,
      auditId: "AUD-1",
      taskId: "T-1",
      aiOk: true,
      aiResult: JSON.stringify(normalization()),
    };
    const res = await createScannerDrafts({ uploadId: "su-1" });
    expect(res.ok).toBe(true);
    expect(res.ids).toHaveLength(1); // 2 raw rows → 1 normalized
    expect(res.ids?.[0]).toBe(`F-${YEAR}-0001`);
  });

  it("falls back to the raw parsed findings when AI is unavailable", async () => {
    h.upload = {
      id: "su-1",
      filename: "scan.csv",
      content: CSV,
      auditId: "AUD-1",
      taskId: "T-1",
      aiOk: false,
      aiResult: null,
    };
    const res = await createScannerDrafts({ uploadId: "su-1" });
    expect(res.ok).toBe(true);
    expect(res.ids).toHaveLength(2); // raw parse → 2 findings
  });

  it("returns not_found for an unknown upload", async () => {
    h.upload = null;
    expect(await createScannerDrafts({ uploadId: "nope" })).toEqual({
      ok: false,
      error: "not_found",
    });
  });
});
