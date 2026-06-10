// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";

const h = vi.hoisted(() => ({
  audit: {
    status: "group_forming",
    leaderId: "u3",
    goal: "Maqsad",
    methodology: "OWASP",
    scope: ["Tashqi perimetr"],
    tools: ["Nmap"],
  },
  project: {
    id: "p1",
    auditId: "AUD-1",
    status: "draft",
    currentApprovalStage: null as string | null,
    audit: { status: "project_draft", leaderId: "u3" },
  },
  kpiFound: null as { id: string } | null,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u3", role: "chief", name: "" })),
}));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    audit: { findUnique: vi.fn(async () => h.audit), update: vi.fn(async () => ({})) },
    auditProject: {
      create: vi.fn(async () => ({ id: "p1" })),
      findUnique: vi.fn(async () => h.project),
      update: vi.fn(async () => ({})),
    },
    auditProjectApproval: { create: vi.fn(async () => ({})) },
    auditLog: { create: vi.fn(async () => ({})) },
    kpiEvent: {
      findFirst: vi.fn(async () => h.kpiFound),
      create: vi.fn(async () => ({})),
    },
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

import { createAuditProject, editProject, projectApproval } from "./projects";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

const validEdit = {
  auditId: "AUD-1",
  goal: "Yangilangan audit maqsadi",
  methodology: "OWASP ASVS",
  scope: ["Tashqi perimetr"],
  tools: ["Nmap 7.94"],
};

beforeEach(() => {
  vi.clearAllMocks();
  h.audit = {
    status: "group_forming",
    leaderId: "u3",
    goal: "Maqsad",
    methodology: "OWASP",
    scope: ["Tashqi perimetr"],
    tools: ["Nmap"],
  };
  h.project = {
    id: "p1",
    auditId: "AUD-1",
    status: "draft",
    currentApprovalStage: null,
    audit: { status: "project_draft", leaderId: "u3" },
  };
  h.kpiFound = null;
});

describe("createAuditProject", () => {
  it("lets the audit leader create a project from group_forming", async () => {
    expect(await createAuditProject({ auditId: "AUD-1" })).toEqual({ ok: true });
    expect(mockPrisma.auditProject.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ auditId: "AUD-1", status: "draft" }),
      }),
    );
    expect(revalidatePath).toHaveBeenCalledWith("/audits/AUD-1");
  });

  it("forbids non-leader chief/lead/t1 users", async () => {
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "chief", name: "" });
    expect(await createAuditProject({ auditId: "AUD-1" })).toEqual({
      ok: false,
      error: "forbidden",
    });
  });

  it("allows head/super administrative override", async () => {
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u2", role: "head", name: "" });
    expect(await createAuditProject({ auditId: "AUD-1" })).toEqual({ ok: true });
  });
});

describe("projectApproval", () => {
  it("submit sets project submitted/head and audit project_pending", async () => {
    expect(await projectApproval({ auditId: "AUD-1", action: "submit" })).toEqual({ ok: true });
    expect(mockPrisma.auditProject.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { status: "submitted", currentApprovalStage: "head" },
    });
    expect(mockPrisma.audit.update).toHaveBeenCalledWith({
      where: { id: "AUD-1" },
      data: { status: "project_pending", stage: 4 },
    });
    expect(mockPrisma.kpiEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "u3", ruleCode: "develop_project" }),
      }),
    );
  });

  it("forbids a non-leader from submitting", async () => {
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "lead", name: "" });
    expect(await projectApproval({ auditId: "AUD-1", action: "submit" })).toEqual({
      ok: false,
      error: "forbidden",
    });
  });

  it("head approve advances to dept", async () => {
    h.project = {
      ...h.project,
      status: "submitted",
      currentApprovalStage: "head",
      audit: { status: "project_pending", leaderId: "u3" },
    };
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u2", role: "head", name: "" });
    expect(await projectApproval({ auditId: "AUD-1", action: "approve" })).toEqual({ ok: true });
    expect(mockPrisma.auditProject.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { status: "submitted", currentApprovalStage: "dept" },
    });
  });

  it("dept approve sets project approved and audit assigning", async () => {
    h.project = {
      ...h.project,
      status: "submitted",
      currentApprovalStage: "dept",
      audit: { status: "project_pending", leaderId: "u3" },
    };
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u1", role: "super", name: "" });
    expect(await projectApproval({ auditId: "AUD-1", action: "approve" })).toEqual({ ok: true });
    expect(mockPrisma.auditProject.update).toHaveBeenCalledWith({
      where: { id: "p1" },
      data: { status: "approved", currentApprovalStage: null },
    });
    expect(mockPrisma.audit.update).toHaveBeenCalledWith({
      where: { id: "AUD-1" },
      data: { status: "assigning", stage: 5 },
    });
  });

  it("return requires a comment", async () => {
    h.project = {
      ...h.project,
      status: "submitted",
      currentApprovalStage: "head",
      audit: { status: "project_pending", leaderId: "u3" },
    };
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u2", role: "head", name: "" });
    expect(await projectApproval({ auditId: "AUD-1", action: "return" })).toEqual({
      ok: false,
      error: "comment_required",
    });
  });

  it("return appends an immutable approval row", async () => {
    h.project = {
      ...h.project,
      status: "submitted",
      currentApprovalStage: "head",
      audit: { status: "project_pending", leaderId: "u3" },
    };
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u2", role: "head", name: "" });
    expect(
      await projectApproval({ auditId: "AUD-1", action: "return", comment: "To'ldiring" }),
    ).toEqual({ ok: true });
    expect(mockPrisma.auditProjectApproval.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        projectId: "p1",
        actorId: "u2",
        action: "Return",
        stage: "head",
        state: "returned",
        comment: "To'ldiring",
      }),
    });
  });
});

describe("editProject", () => {
  it("saves content for the leader while drafting", async () => {
    expect(await editProject(validEdit)).toEqual({ ok: true });
    expect(mockPrisma.auditProject.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "p1" },
        data: expect.objectContaining({ goal: validEdit.goal, scope: validEdit.scope }),
      }),
    );
  });

  it("forbids a non-leader", async () => {
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "t1", name: "" });
    expect(await editProject(validEdit)).toEqual({ ok: false, error: "forbidden" });
  });

  it("rejects editing once past draft/returned", async () => {
    h.project = { ...h.project, status: "submitted", currentApprovalStage: "head" };
    expect(await editProject(validEdit)).toEqual({ ok: false, error: "illegal_status" });
  });
});
