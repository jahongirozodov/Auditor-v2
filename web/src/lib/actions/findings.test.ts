// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";

const YEAR = new Date().toISOString().slice(0, 4); // same clock createFinding uses

const h = vi.hoisted(() => ({
  finding: {
    id: "F-1",
    status: "review",
    approvalStage: "group_lead",
    reportedById: "u1",
    auditId: "AUD-1",
    taskId: "T-1",
    severity: "high",
  },
  audit: { id: "AUD-1" } as { id: string } | null,
  task: { auditId: "AUD-1", assigneeId: "u6" } as { auditId: string; assigneeId: string } | null,
  findings: [] as { id: string; severity: string }[],
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u1", role: "lead", name: "" })),
}));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => true) }));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    finding: {
      findUnique: vi.fn(async () => h.finding),
      update: vi.fn(async () => ({})),
      create: vi.fn(async () => ({})),
      findMany: vi.fn(async () => h.findings),
    },
    audit: { findUnique: vi.fn(async () => h.audit), update: vi.fn(async () => ({})) },
    task: { findUnique: vi.fn(async () => h.task) },
    fileStorage: { create: vi.fn(async () => ({ id: "file-1" })) },
    findingEvidence: { create: vi.fn(async () => ({})) },
    approvalEvent: { create: vi.fn(async () => ({})) },
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

import { createFinding, findingApproval, findingRemediation } from "./findings";
import { prisma } from "@/lib/prisma";
// kpiEvent/kpiUser land with the schema migration; cast until `prisma db push` regenerates the client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

beforeEach(() => {
  vi.clearAllMocks();
  h.finding = {
    id: "F-1",
    status: "review",
    approvalStage: "group_lead",
    reportedById: "u1",
    auditId: "AUD-1",
    taskId: "T-1",
    severity: "high",
  };
  h.audit = { id: "AUD-1" };
  h.task = { auditId: "AUD-1", assigneeId: "u6" };
  h.findings = [{ id: `F-${YEAR}-0350`, severity: "high" }];
});

describe("findingApproval", () => {
  it("approves at the group_lead stage and revalidates", async () => {
    const res = await findingApproval({ findingId: "F-1", action: "approve" });
    expect(res).toEqual({ ok: true });
    expect(revalidatePath).toHaveBeenCalledWith("/findings");
  });

  it("requires a comment to return", async () => {
    const res = await findingApproval({ findingId: "F-1", action: "return" });
    expect(res).toEqual({ ok: false, error: "comment_required" });
  });

  it("forbids a t1 from acting at the head stage", async () => {
    h.finding.approvalStage = "head";
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "t1", name: "" });
    const res = await findingApproval({ findingId: "F-1", action: "approve" });
    expect(res).toEqual({ ok: false, error: "forbidden" });
  });

  it("rejects submit on a finding already in review", async () => {
    const res = await findingApproval({ findingId: "F-1", action: "submit" });
    expect(res).toEqual({ ok: false, error: "illegal_transition" });
  });

  it("lets the reporter submit a new finding", async () => {
    h.finding.status = "new";
    h.finding.approvalStage = "";
    const res = await findingApproval({ findingId: "F-1", action: "submit" });
    expect(res).toEqual({ ok: true });
  });
});

const validCreate = {
  auditId: "AUD-1",
  taskId: "T-1",
  title: "Yangi topilma sarlavhasi",
  severity: "low" as const,
  cvss: 3.0,
  cwe: "CWE-284",
  asset: "FW-CORE-01",
  type: "Konfiguratsiya kamchiligi",
  description: "Tavsif",
};
const validEvidenceImage = {
  filename: "screenshot.png",
  mimeType: "image/png" as const,
  sizeBytes: Buffer.from("image-bytes").length,
  dataBase64: Buffer.from("image-bytes").toString("base64"),
};

describe("createFinding", () => {
  it("creates the next code (status new) and revalidates", async () => {
    const res = await createFinding(validCreate);
    expect(res).toEqual({ ok: true, id: `F-${YEAR}-0351` });
    expect(revalidatePath).toHaveBeenCalledWith("/findings");
  });

  it("creates image evidence with the finding", async () => {
    const res = await createFinding({ ...validCreate, evidenceImages: [validEvidenceImage] });
    expect(res).toEqual({ ok: true, id: `F-${YEAR}-0351` });
    expect(mockPrisma.finding.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ evidence: 1 }),
      }),
    );
    expect(mockPrisma.fileStorage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          filename: "screenshot.png",
          mimeType: "image/png",
          provider: "db",
          uploadedById: "u1",
        }),
      }),
    );
    expect(mockPrisma.findingEvidence.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          findingId: `F-${YEAR}-0351`,
          fileId: "file-1",
          kind: "screenshot",
        }),
      }),
    );
  });

  it("rejects invalid evidence images", async () => {
    expect(
      await createFinding({
        ...validCreate,
        evidenceImages: [{ ...validEvidenceImage, mimeType: "text/plain" as never }],
      }),
    ).toEqual({ ok: false, error: "invalid" });
    expect(
      await createFinding({
        ...validCreate,
        evidenceImages: [{ ...validEvidenceImage, sizeBytes: validEvidenceImage.sizeBytes + 1 }],
      }),
    ).toEqual({ ok: false, error: "invalid" });
    expect(
      await createFinding({
        ...validCreate,
        evidenceImages: Array.from({ length: 6 }, (_, i) => ({
          ...validEvidenceImage,
          filename: `screenshot-${i}.png`,
        })),
      }),
    ).toEqual({ ok: false, error: "invalid" });
  });

  it("rejects a task that belongs to another audit", async () => {
    h.task = { auditId: "AUD-OTHER", assigneeId: "u6" };
    expect(await createFinding({ ...validCreate, evidenceImages: [validEvidenceImage] })).toEqual({
      ok: false,
      error: "task_mismatch",
    });
    expect(mockPrisma.fileStorage.create).not.toHaveBeenCalled();
  });

  it("rejects when the audit is missing", async () => {
    h.audit = null;
    expect(await createFinding(validCreate)).toEqual({ ok: false, error: "not_found" });
  });

  it("rejects an invalid (too short) title", async () => {
    expect(await createFinding({ ...validCreate, title: "x" })).toEqual({
      ok: false,
      error: "invalid",
    });
  });
});

describe("findingRemediation", () => {
  it("lets the task assignee start fixing an approved finding", async () => {
    h.finding.status = "approved";
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u6", role: "t1", name: "" });
    const res = await findingRemediation({ findingId: "F-1", action: "startFixing" });
    expect(res).toEqual({ ok: true });
    expect(revalidatePath).toHaveBeenCalledWith("/findings");
  });

  it("lets a lead pass the retest (→ closed)", async () => {
    h.finding.status = "retest";
    const res = await findingRemediation({ findingId: "F-1", action: "passRetest" });
    expect(res).toEqual({ ok: true });
  });

  it("forbids a non-assignee t1 from starting a fix", async () => {
    h.finding.status = "approved";
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "t1", name: "" });
    expect(await findingRemediation({ findingId: "F-1", action: "startFixing" })).toEqual({
      ok: false,
      error: "forbidden",
    });
  });

  it("requires a comment to fail a retest", async () => {
    h.finding.status = "retest";
    expect(await findingRemediation({ findingId: "F-1", action: "failRetest" })).toEqual({
      ok: false,
      error: "comment_required",
    });
  });

  it("rejects an illegal transition (startRetest from approved)", async () => {
    h.finding.status = "approved";
    expect(await findingRemediation({ findingId: "F-1", action: "startRetest" })).toEqual({
      ok: false,
      error: "illegal_transition",
    });
  });
});

describe("findingApproval KPI emission", () => {
  // Final dept-stage approve → status "approved" → reporter earns vuln_approved + a severity bonus.
  it("emits vuln_approved + vuln_critical_bonus on final-stage approve of a critical finding", async () => {
    h.finding = {
      id: "F-1",
      status: "review",
      approvalStage: "dept", // last stage → nextStage(dept)=null → approved
      reportedById: "u1",
      auditId: "AUD-1",
      taskId: "T-1",
      severity: "critical",
    };
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u1", role: "super", name: "" });
    const res = await findingApproval({ findingId: "F-1", action: "approve" });
    expect(res).toEqual({ ok: true });
    const calls = mockPrisma.kpiEvent.create.mock.calls as [
      { data: { ruleCode: string; userId: string } },
    ][];
    const codes = calls.map((c) => c[0].data.ruleCode);
    expect(codes).toContain("vuln_approved");
    expect(codes).toContain("vuln_critical_bonus");
    // Both events are credited to the reporter, not the approver.
    expect(calls.every((c) => c[0].data.userId === "u1")).toBe(true);
  });

  it("does NOT emit KPI events on a non-final approve (group_lead → head)", async () => {
    // Default fixture sits at group_lead; approve advances to head (status stays "review").
    const res = await findingApproval({ findingId: "F-1", action: "approve" });
    expect(res).toEqual({ ok: true });
    expect(mockPrisma.kpiEvent.create).not.toHaveBeenCalled();
  });
});
