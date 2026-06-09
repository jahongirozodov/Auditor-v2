// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { revalidatePath } from "next/cache";

const YEAR = new Date().toISOString().slice(0, 4);

// Cisco ASA sample → 4 gaps (no security-level, permit tcp any any, telnet, no logging trap).
const ASA = `! ASA 9.16(4)
hostname FW-CORE-01
interface Gi0/0
 nameif inside
 no security-level
access-list X extended permit tcp any any
telnet 0.0.0.0 0.0.0.0 inside
no logging trap`;

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
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u6", role: "lead", name: "" })),
}));
vi.mock("@/lib/rbac", () => ({ canView: vi.fn(() => h.canView) }));
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
    },
    analyzedDevice: { create: vi.fn(async () => ({})) },
    aiAnalysisResult: { findFirst: vi.fn(async () => h.ai) },
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

import { uploadConfig, createConfigDrafts } from "./config";
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
});

describe("uploadConfig", () => {
  it("parses, persists the upload + device, logs and credits the KPI", async () => {
    const res = await uploadConfig(validUpload);
    expect(res).toMatchObject({ ok: true, uploadId: "cu-1", vendor: "cisco_asa", gapCount: 4 });
    expect(mockPrisma.configUpload.create).toHaveBeenCalledOnce();
    expect(mockPrisma.analyzedDevice.create).toHaveBeenCalledOnce();
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

  it("rejects when the audit is missing", async () => {
    h.audit = null;
    expect(await uploadConfig(validUpload)).toEqual({ ok: false, error: "not_found" });
  });

  it("rejects invalid input", async () => {
    expect(await uploadConfig({ ...validUpload, filename: "" })).toEqual({
      ok: false,
      error: "invalid",
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
  });

  it("materializes a draft finding per detected gap and logs it", async () => {
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
