"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { getOllamaConfig } from "@/lib/ai/ollama";
import { analyzeAuditAI } from "@/lib/analysis/audit/ai";
import type { AuditAnalysis } from "@/lib/analysis/audit/types";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));

export interface AnalyzeAuditActionResult {
  ok: boolean;
  error?: string;
  analysis?: AuditAnalysis;
}

/**
 * Run the whole-audit AI analysis (findings + module signals) and persist it
 * (`AuditAiAnalysis`). Graceful — an empty audit or down model returns an error
 * code and stores nothing; the tab keeps working.
 */
export async function analyzeAudit(input: { auditId: string }): Promise<AnalyzeAuditActionResult> {
  const auditId = z.string().min(1).safeParse(input?.auditId);
  if (!auditId.success) return { ok: false, error: "invalid" };

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "ai.use"))) return { ok: false, error: "forbidden" };

  const r = await analyzeAuditAI(auditId.data);
  if (!r.ok || !r.analysis) return { ok: false, error: r.reason ?? "ai_unavailable" };
  const { model } = getOllamaConfig();

  await prisma.auditAiAnalysis.create({
    data: {
      auditId: auditId.data,
      model,
      input: `audit:${auditId.data}`,
      output: r.raw,
      latencyMs: r.latencyMs,
      tokens: r.tokens,
      ok: true,
      createdById: userId,
    },
  });
  await prisma.auditLog.create({
    data: {
      userId,
      action: "audit.ai_analyze",
      entity: auditId.data,
      level: "info",
      payload: J({ overallRisk: r.analysis.overallRisk, topRisks: r.analysis.topRisks.length }),
    },
  });

  revalidatePath(`/audits/${auditId.data}`);
  return { ok: true, analysis: r.analysis };
}
