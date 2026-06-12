import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Appeal, AppealFileItem, AppealPriority, AppealStatus, AppealType } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

const FILE_SELECT = {
  select: {
    id: true,
    fileId: true,
    createdAt: true,
    file: { select: { filename: true, mimeType: true, sizeBytes: true } },
  },
} as const;

type AppealRow = Awaited<ReturnType<typeof prisma.appeal.findMany>>[number] & {
  files: {
    id: string;
    fileId: string;
    createdAt: Date;
    file: { filename: string; mimeType: string; sizeBytes: number };
  }[];
};

function toFileItem(f: {
  id: string;
  fileId: string;
  createdAt: Date;
  file: { filename: string; mimeType: string; sizeBytes: number };
}): AppealFileItem {
  return {
    id: f.id,
    fileId: f.fileId,
    filename: f.file.filename,
    mimeType: f.file.mimeType,
    sizeBytes: f.file.sizeBytes,
    createdAt: f.createdAt.toISOString(),
  };
}

function toAppeal(row: AppealRow): Appeal {
  return {
    id: row.id,
    type: row.type as AppealType,
    title: row.title,
    description: row.description,
    priority: (row.priority as AppealPriority) ?? null,
    status: row.status as AppealStatus,
    reviewComment: row.reviewComment ?? null,
    submittedById: row.submittedById,
    reviewedById: row.reviewedById ?? null,
    reviewedAt: row.reviewedAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    files: row.files.map(toFileItem),
  };
}

export const getAppeals = cache(async (userId: string, role: RoleCode): Promise<Appeal[]> => {
  const where = role === "super" ? {} : { submittedById: userId };
  const rows = await prisma.appeal.findMany({
    where,
    include: { files: FILE_SELECT },
    orderBy: { createdAt: "desc" },
  });
  return (rows as AppealRow[]).map(toAppeal);
});

export const getAppealFileForDownload = cache(
  async (appealId: string, fileId: string) =>
    prisma.appealFile.findFirst({
      where: { id: fileId, appealId },
      select: {
        appealId: true,
        uploadedById: true,
        file: { select: { filename: true, mimeType: true, bytes: true } },
      },
    }),
);
