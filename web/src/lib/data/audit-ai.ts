import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { parseAuditAnalysis, type AuditAiAnalysis } from "@/lib/ai/prompts";

/** Latest persisted whole-audit AI analysis — hydrates the audit-detail AI tab. */
export const getLatestAuditAnalysis = cache(
  async (auditId: string): Promise<AuditAiAnalysis | null> => {
    const row = await prisma.auditAiAnalysis.findFirst({
      where: { auditId, ok: true },
      orderBy: { createdAt: "desc" },
      select: { output: true },
    });
    return parseAuditAnalysis(row?.output);
  },
);
