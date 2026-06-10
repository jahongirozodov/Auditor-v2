// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  canManageEvidence: true,
  canManage: false,
  evidence: {
    auditId: "AUD-1",
    fileId: "f1",
    file: { uploadedById: "u1" },
    audit: { leaderId: "u9" },
  } as Record<string, unknown> | null,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u1", role: "t1", name: "" })),
}));
vi.mock("@/lib/rbac", () => ({ canManage: () => h.canManage }));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => h.canManage) }));
vi.mock("@/lib/audit-access", () => ({
  canManageEvidence: vi.fn(async () => h.canManageEvidence),
}));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    fileStorage: { create: vi.fn(async () => ({ id: "f1" })), delete: vi.fn(async () => ({})) },
    auditEvidence: {
      create: vi.fn(async () => ({})),
      delete: vi.fn(async () => ({})),
      findUnique: vi.fn(async () => h.evidence),
    },
    auditLog: { create: vi.fn(async () => ({})) },
    $transaction: vi.fn(),
  };
  prisma.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === "function" ? (arg as (tx: typeof prisma) => unknown)(prisma) : undefined,
  );
  return { prisma };
});

import { prisma } from "@/lib/prisma";
import { addAuditEvidence, deleteAuditEvidence } from "./evidence";

function fd(parts: { auditId?: string; comment?: string; file?: File | null }) {
  const f = new FormData();
  if (parts.auditId !== undefined) f.set("auditId", parts.auditId);
  if (parts.comment !== undefined) f.set("comment", parts.comment);
  if (parts.file) f.set("file", parts.file);
  return f;
}

const smallFile = () => new File([new Uint8Array([1, 2, 3])], "shot.png", { type: "image/png" });

beforeEach(() => {
  vi.clearAllMocks();
  h.canManageEvidence = true;
  h.canManage = false;
  h.evidence = {
    auditId: "AUD-1",
    fileId: "f1",
    file: { uploadedById: "u1" },
    audit: { leaderId: "u9" },
  };
});

describe("addAuditEvidence", () => {
  it("stores the file + evidence + audit log on success", async () => {
    const res = await addAuditEvidence(fd({ auditId: "AUD-1", comment: "dalil", file: smallFile() }));
    expect(res).toEqual({ ok: true });
    expect(prisma.fileStorage.create).toHaveBeenCalled();
    expect(prisma.auditEvidence.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ auditId: "AUD-1", comment: "dalil" }) }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it("requires a comment", async () => {
    const res = await addAuditEvidence(fd({ auditId: "AUD-1", comment: "  ", file: smallFile() }));
    expect(res).toEqual({ ok: false, error: "comment_required" });
    expect(prisma.fileStorage.create).not.toHaveBeenCalled();
  });

  it("rejects a file over 5 MB", async () => {
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.pcap", { type: "application/octet-stream" });
    const res = await addAuditEvidence(fd({ auditId: "AUD-1", comment: "dalil", file: big }));
    expect(res).toEqual({ ok: false, error: "too_large" });
  });

  it("forbids non-members", async () => {
    h.canManageEvidence = false;
    const res = await addAuditEvidence(fd({ auditId: "AUD-1", comment: "dalil", file: smallFile() }));
    expect(res).toEqual({ ok: false, error: "forbidden" });
    expect(prisma.fileStorage.create).not.toHaveBeenCalled();
  });

  it("requires a file", async () => {
    const res = await addAuditEvidence(fd({ auditId: "AUD-1", comment: "dalil" }));
    expect(res).toEqual({ ok: false, error: "no_file" });
  });
});

describe("deleteAuditEvidence", () => {
  it("lets the uploader delete", async () => {
    const res = await deleteAuditEvidence("e1");
    expect(res).toEqual({ ok: true });
    expect(prisma.auditEvidence.delete).toHaveBeenCalledWith({ where: { id: "e1" } });
    expect(prisma.fileStorage.delete).toHaveBeenCalledWith({ where: { id: "f1" } });
  });

  it("forbids a non-uploader, non-leader, non-admin", async () => {
    h.evidence = { auditId: "AUD-1", fileId: "f1", file: { uploadedById: "uX" }, audit: { leaderId: "uY" } };
    const res = await deleteAuditEvidence("e1");
    expect(res).toEqual({ ok: false, error: "forbidden" });
    expect(prisma.auditEvidence.delete).not.toHaveBeenCalled();
  });

  it("returns not_found for a missing row", async () => {
    h.evidence = null;
    const res = await deleteAuditEvidence("eX");
    expect(res).toEqual({ ok: false, error: "not_found" });
  });
});
