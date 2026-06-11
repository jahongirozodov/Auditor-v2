// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import type { RoleCode } from "@/lib/types/roles";

const h = vi.hoisted(() => ({
  userId: "u1",
  role: "t1" as RoleCode,
  permission: true,
  isMember: false,
  isLeader: false,
  report: {
    id: "R-1",
    auditId: "AUD-1",
    authorId: "u9",
    status: "draft",
    title: "Test",
    type: "pentest",
    approvalStage: null as string | null,
    generated: "—",
    size: "—",
    format: ["pdf"],
    summary: null as string | null,
  } as Record<string, unknown> | null,
  audit: { id: "AUD-1", title: "Test Audit", code: "A-001" } as Record<string, unknown> | null,
}));

vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: h.userId, role: h.role, name: "" })),
}));
vi.mock("@/lib/rbac.server", () => ({
  requirePermission: vi.fn(async () => h.permission),
}));
vi.mock("@/lib/audit-access", () => ({
  isAuditMember: vi.fn(async () => h.isMember),
  isAuditLeader: vi.fn(async () => h.isLeader),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    report: {
      create: vi.fn(async () => ({ id: "R-new" })),
      delete: vi.fn(async () => ({})),
      findUnique: vi.fn(async () => h.report),
      update: vi.fn(async () => ({})),
    },
    audit: { findUnique: vi.fn(async () => h.audit) },
    finding: { findMany: vi.fn(async () => []) },
    task: { findMany: vi.fn(async () => []) },
    aiAnalysisResult: { create: vi.fn(async () => ({})) },
    $transaction: vi.fn(async (ops: unknown) =>
      Array.isArray(ops) ? Promise.all(ops) : (ops as (tx: unknown) => Promise<unknown>)({}),
    ),
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/ai/ollama", () => ({
  isAiEnabled: vi.fn(() => false),
  getOllamaConfig: vi.fn(() => ({ model: "test-model" })),
  generate: vi.fn(async () => ({ ok: false, text: "", tokens: 0, latencyMs: 0 })),
}));
vi.mock("@/lib/kpi/events", () => ({ emitKpiEvent: vi.fn(async () => {}) }));
vi.mock("@/lib/approval", () => ({
  canActAt: vi.fn(() => false),
  nextStage: vi.fn(() => null),
  reportCurrentOf: vi.fn(() => "new"),
}));
vi.mock("@/lib/ai/prompts", () => ({ SYSTEM: { chat: "You are a helpful assistant." } }));

import { generateReport, deleteReport, regenerateReportSummary } from "./reports";

beforeEach(() => {
  h.userId = "u1";
  h.role = "t1";
  h.permission = true;
  h.isMember = false;
  h.isLeader = false;
  h.report = {
    id: "R-1",
    auditId: "AUD-1",
    authorId: "u9",
    status: "draft",
    title: "Test",
    type: "pentest",
    approvalStage: null,
    generated: "—",
    size: "—",
    format: ["pdf"],
    summary: null,
  };
  h.audit = { id: "AUD-1", title: "Test Audit", code: "A-001" };
});

describe("generateReport — membership gate", () => {
  it("throws when user is not audit member", async () => {
    await expect(
      generateReport({ title: "T", auditId: "AUD-1", type: "pentest", formats: ["pdf"] }),
    ).rejects.toThrow();
  });
  it("allows when user is audit member", async () => {
    h.isMember = true;
    const r = await generateReport({ title: "T", auditId: "AUD-1", type: "pentest", formats: ["pdf"] });
    expect(r.ok).toBe(true);
  });
});

describe("deleteReport — authorship + leader gate", () => {
  it("throws when user is neither author nor leader", async () => {
    await expect(deleteReport("R-1")).rejects.toThrow();
  });
  it("allows when user is the report author", async () => {
    h.userId = "u9"; // matches report.authorId
    const r = await deleteReport("R-1");
    expect(r.ok).toBe(true);
  });
  it("allows when user is audit leader", async () => {
    h.isLeader = true;
    const r = await deleteReport("R-1");
    expect(r.ok).toBe(true);
  });
});

describe("regenerateReportSummary — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await regenerateReportSummary("R-1");
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
  it("allows when user is audit member", async () => {
    h.isMember = true;
    const r = await regenerateReportSummary("R-1");
    // AI is disabled so it degrades, but it must pass the membership gate (not return forbidden)
    expect(r).not.toEqual({ ok: false, error: "forbidden" });
  });
});
