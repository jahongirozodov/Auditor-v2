import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { AuditEvidenceView } from "@/lib/types/entities";

/** Audit-level evidence list for the Fayllar & dalillar tab (bytes excluded). */
export const getAuditEvidence = cache(async (auditId: string): Promise<AuditEvidenceView[]> => {
  const rows = await prisma.auditEvidence.findMany({
    where: { auditId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      comment: true,
      createdAt: true,
      file: {
        select: {
          filename: true,
          mimeType: true,
          sizeBytes: true,
          uploadedById: true,
          uploadedBy: { select: { name: true, avatar: true } },
        },
      },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    filename: r.file.filename,
    mimeType: r.file.mimeType,
    sizeBytes: r.file.sizeBytes,
    comment: r.comment,
    uploadedBy: r.file.uploadedById,
    uploadedByName: r.file.uploadedBy.name,
    uploadedByAvatar: r.file.uploadedBy.avatar,
    createdAt: r.createdAt.toISOString(),
  }));
});
