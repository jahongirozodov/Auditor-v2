// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";

const h = vi.hoisted(() => ({
  audit: { status: "project_pending", projectStage: "head" },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u2", role: "head", name: "" })),
}));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    audit: { findUnique: vi.fn(async () => h.audit), update: vi.fn(async () => ({})) },
    approvalEvent: { create: vi.fn(async () => ({})) },
    auditLog: { create: vi.fn(async () => ({})) },
    $transaction: vi.fn(),
  };
  prisma.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === "function"
      ? (arg as (tx: typeof prisma) => unknown)(prisma)
      : Promise.all(arg as unknown[]),
  );
  return { prisma };
});

import { editProject, projectApproval } from "./projects";

beforeEach(() => {
  vi.clearAllMocks();
  h.audit = { status: "project_pending", projectStage: "head" };
});

describe("projectApproval", () => {
  it("lets the head approve at the head stage (advances to dept)", async () => {
    const res = await projectApproval({ auditId: "AUD-1", action: "approve" });
    expect(res).toEqual({ ok: true });
    expect(revalidatePath).toHaveBeenCalledWith("/audits/AUD-1");
  });

  it("forbids a t1 from approving", async () => {
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "t1", name: "" });
    const res = await projectApproval({ auditId: "AUD-1", action: "approve" });
    expect(res).toEqual({ ok: false, error: "forbidden" });
  });

  it("requires a comment to return", async () => {
    const res = await projectApproval({ auditId: "AUD-1", action: "return" });
    expect(res).toEqual({ ok: false, error: "comment_required" });
  });

  it("rejects submit when already pending", async () => {
    const res = await projectApproval({ auditId: "AUD-1", action: "submit" });
    expect(res).toEqual({ ok: false, error: "illegal_transition" });
  });

  it("dept approval moves the audit to assigning", async () => {
    h.audit = { status: "project_pending", projectStage: "dept" };
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u1", role: "super", name: "" });
    const res = await projectApproval({ auditId: "AUD-1", action: "approve" });
    expect(res).toEqual({ ok: true });
  });

  it("lets a group lead submit a draft", async () => {
    h.audit = { status: "project_draft", projectStage: "" };
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u3", role: "chief", name: "" });
    const res = await projectApproval({ auditId: "AUD-1", action: "submit" });
    expect(res).toEqual({ ok: true });
  });
});

const validEdit = {
  auditId: "AUD-1",
  goal: "Yangilangan audit maqsadi",
  methodology: "OWASP ASVS",
  scope: ["Tashqi perimetr"],
  tools: ["Nmap 7.94"],
};

describe("editProject", () => {
  it("saves content for a group lead while drafting", async () => {
    h.audit = { status: "project_draft", projectStage: "" };
    const res = await editProject(validEdit);
    expect(res).toEqual({ ok: true });
    expect(revalidatePath).toHaveBeenCalledWith("/audits/AUD-1");
  });

  it("forbids a t1", async () => {
    h.audit = { status: "project_draft", projectStage: "" };
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "t1", name: "" });
    expect(await editProject(validEdit)).toEqual({ ok: false, error: "forbidden" });
  });

  it("rejects editing once past the draft/returned window", async () => {
    h.audit = { status: "in_progress", projectStage: "" };
    expect(await editProject(validEdit)).toEqual({ ok: false, error: "illegal_status" });
  });
});
