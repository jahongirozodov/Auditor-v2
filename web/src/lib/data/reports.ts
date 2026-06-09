import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Report, ReportStatus } from "@/lib/types/entities";

export const getReportsByAudit = cache(async (auditId: string): Promise<Report[]> => {
  const rows = await prisma.report.findMany({ where: { auditId } });
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    audit: r.auditId,
    type: r.type,
    status: r.status as ReportStatus,
    generated: r.generated,
    size: r.size,
    format: r.format as string[],
    author: r.authorId,
  }));
});
