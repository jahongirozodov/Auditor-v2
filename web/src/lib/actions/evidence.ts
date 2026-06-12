"use server";

import { revalidatePath } from "next/cache";
import { createHash } from "crypto";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { canManageEvidence } from "@/lib/audit-access";
import type { ActionResult } from "./types";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB (DB-blob storage; MinIO deferred)

/**
 * Add one evidence artifact to an audit (Fayllar & dalillar tab). Only audit
 * group members, the leader, or an admin may add. A comment is mandatory. The
 * file bytes are stored in FileStorage (provider "db"); MinIO is deferred.
 */
export async function addAuditEvidence(formData: FormData): Promise<ActionResult> {
  const { userId } = await requireSession();

  const auditId = String(formData.get("auditId") ?? "");
  const comment = String(formData.get("comment") ?? "").trim();
  const file = formData.get("file");

  if (!auditId) return { ok: false, error: "invalid" };
  if (!comment) return { ok: false, error: "comment_required" };
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "no_file" };
  if (file.size > MAX_BYTES) return { ok: false, error: "too_large" };

  if (!(await canManageEvidence(auditId, userId))) return { ok: false, error: "forbidden" };

  const buf = Buffer.from(await file.arrayBuffer());
  const sha256 = createHash("sha256").update(buf).digest("hex");

  await prisma.$transaction(async (tx) => {
    const stored = await tx.fileStorage.create({
      data: {
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: buf.length,
        sha256,
        provider: "db",
        bytes: buf,
        uploadedById: userId,
      },
    });
    await tx.auditEvidence.create({
      data: { auditId, fileId: stored.id, comment },
    });
    await tx.auditLog.create({
      data: {
        userId,
        action: "evidence.add",
        entity: auditId,
        level: "info",
        payload: J({ filename: file.name, sizeBytes: buf.length }),
      },
    });
  });

  revalidatePath(`/audits/${auditId}`);
  return { ok: true };
}

/** Delete an evidence row (+ its file). Allowed for the uploader, the audit leader, or an admin. */
export async function deleteAuditEvidence(id: string): Promise<ActionResult> {
  const { userId } = await requireSession();

  const ev = await prisma.auditEvidence.findUnique({
    where: { id },
    select: {
      auditId: true,
      fileId: true,
      file: { select: { uploadedById: true } },
      audit: { select: { leaderId: true } },
    },
  });
  if (!ev) return { ok: false, error: "not_found" };

  const isUploader = ev.file.uploadedById === userId;
  const isLeader = ev.audit.leaderId === userId;
  if (!(isUploader || isLeader || (await requirePermission(userId, "audit.update"))))
    return { ok: false, error: "forbidden" };

  await prisma.$transaction(async (tx) => {
    await tx.auditEvidence.delete({ where: { id } });
    // FileStorage row is not cascaded from evidence → remove it explicitly.
    await tx.fileStorage.delete({ where: { id: ev.fileId } });
    await tx.auditLog.create({
      data: { userId, action: "evidence.delete", entity: ev.auditId, level: "warn" },
    });
  });

  revalidatePath(`/audits/${ev.auditId}`);
  return { ok: true };
}
