import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { ScannerUploadView, ScanImportRowView } from "@/lib/types/entities";
import { parseScannerNormalization, type ScannerAiNormalization } from "@/lib/ai/prompts";

type AggRow = { critical?: number; high?: number; medium?: number; low?: number; info?: number };

function toUploadView(u: {
  id: string;
  filename: string;
  scanner: string;
  content: string;
  auditId: string;
  taskId: string;
  status: string;
  findingCount: number;
  aiOk: boolean;
  createdAt: Date;
}): ScannerUploadView {
  return {
    id: u.id,
    filename: u.filename,
    scanner: u.scanner,
    content: u.content,
    auditId: u.auditId,
    taskId: u.taskId,
    status: u.status,
    findingCount: u.findingCount,
    aiOk: u.aiOk,
    createdAt: u.createdAt.toISOString(),
  };
}

/** Most recent scanner uploads, newest first — drives the recent-imports table. */
export const getRecentScannerImports = cache(async (): Promise<ScanImportRowView[]> => {
  const rows = await prisma.scannerUpload.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { audit: { select: { code: true } } },
  });
  return rows.map((r) => {
    const agg = (r.severityAgg as AggRow | null) ?? {};
    return {
      id: r.id,
      filename: r.filename,
      scanner: r.scanner,
      auditCode: r.audit.code,
      severityAgg: {
        critical: agg.critical ?? 0,
        high: agg.high ?? 0,
        medium: agg.medium ?? 0,
        low: agg.low ?? 0,
        info: agg.info ?? 0,
      },
      status: r.status,
      createdAt: r.createdAt.toISOString(),
    };
  });
});

/** Most recent upload — raw content for client-side re-derive. */
export const getLatestScannerUpload = cache(async (): Promise<ScannerUploadView | null> => {
  const u = await prisma.scannerUpload.findFirst({ orderBy: { createdAt: "desc" } });
  return u ? toUploadView(u) : null;
});

/** Single upload by id. */
export const getScannerUpload = cache(async (id: string): Promise<ScannerUploadView | null> => {
  const u = await prisma.scannerUpload.findUnique({ where: { id } });
  return u ? toUploadView(u) : null;
});

/** Stored AI normalization for an upload — hydrates the screen on load. */
export const getLatestScannerNormalization = cache(
  async (id: string): Promise<ScannerAiNormalization | null> => {
    const u = await prisma.scannerUpload.findUnique({
      where: { id },
      select: { aiResult: true, aiOk: true },
    });
    return u?.aiOk ? parseScannerNormalization(u.aiResult) : null;
  },
);
