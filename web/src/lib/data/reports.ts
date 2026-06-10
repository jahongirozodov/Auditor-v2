import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Report, ReportStatus } from "@/lib/types/entities";

function toReport(r: {
  id: string;
  title: string;
  auditId: string;
  type: string;
  status: string;
  generated: string;
  size: string;
  format: unknown;
  authorId: string;
  approvalStage: string | null;
  summary: string | null;
}): Report {
  return {
    id: r.id,
    title: r.title,
    audit: r.auditId,
    type: r.type,
    status: r.status as ReportStatus,
    generated: r.generated,
    size: r.size,
    format: r.format as string[],
    author: r.authorId,
    approvalStage: r.approvalStage,
    summary: r.summary,
  };
}

export const getReportsByAudit = cache(async (auditId: string): Promise<Report[]> => {
  const rows = await prisma.report.findMany({ where: { auditId } });
  return rows.map(toReport);
});

export const getReportById = cache(async (id: string): Promise<Report | null> => {
  const r = await prisma.report.findUnique({ where: { id } });
  return r ? toReport(r) : null;
});

export const getReports = cache(async (): Promise<Report[]> => {
  const rows = await prisma.report.findMany({ orderBy: { id: "desc" } });
  return rows.map(toReport);
});
