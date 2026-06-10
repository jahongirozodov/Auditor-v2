"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { emitKpiEvent } from "@/lib/kpi-engine";
import { analyzeConfigAI } from "@/lib/analysis/config";
import { gapToFindingInput } from "@/lib/analysis/config/to-finding";
import type { ConfigAnalysis, GapSeverity } from "@/lib/analysis/config";
import { getOllamaConfig } from "@/lib/ai/ollama";
import { parseConfigAnalysis } from "@/lib/ai/prompts";
import { materializeFindings, type FindingRowInput } from "./findings";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB — configs are small text files

function severityAgg(analysis: ConfigAnalysis): Record<GapSeverity, number> {
  const agg: Record<GapSeverity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const g of analysis.gaps) agg[g.severity]++;
  return agg;
}

const UploadInput = z.object({
  filename: z.string().min(1).max(256),
  content: z.string().min(1),
  auditId: z.string().min(1),
  taskId: z.string().min(1),
});

export interface UploadConfigResult {
  ok: boolean;
  error?: string;
  uploadId?: string;
  vendor?: string;
  filename?: string;
  gapCount?: number;
  analysis?: ConfigAnalysis;
}

/**
 * Upload + analyze a device config. Detection is AI-driven (local Ollama): the
 * model returns the vendor, device, and gaps. Hard dependency — if the model is
 * unreachable the upload fails (`ai_unavailable`) and nothing is persisted. On
 * success the full analysis is stored (AiAnalysisResult) so gaps are stable for
 * draft creation, and aggregates/KPI/audit-log are written.
 */
export async function uploadConfig(
  input: z.input<typeof UploadInput>,
): Promise<UploadConfigResult> {
  const parsed = UploadInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { filename, content, auditId, taskId } = parsed.data;

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "config.upload"))) return { ok: false, error: "forbidden" };

  const sizeBytes = Buffer.byteLength(content, "utf8");
  if (sizeBytes > MAX_BYTES) return { ok: false, error: "too_large" };

  const audit = await prisma.audit.findUnique({ where: { id: auditId }, select: { id: true } });
  if (!audit) return { ok: false, error: "not_found" };
  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { auditId: true } });
  if (!task) return { ok: false, error: "not_found" };
  if (task.auditId !== auditId) return { ok: false, error: "task_mismatch" };

  const r = await analyzeConfigAI(filename, content);
  if (!r.ok || !r.analysis) return { ok: false, error: "ai_unavailable" };
  const analysis = r.analysis;
  const sevAgg = severityAgg(analysis);
  const { model } = getOllamaConfig();

  let uploadId = "";
  await prisma.$transaction(async (tx) => {
    const upload = await tx.configUpload.create({
      data: {
        filename,
        vendor: analysis.device.vendor,
        content,
        sizeBytes,
        gapCount: analysis.gaps.length,
        severityAgg: J(sevAgg),
        auditId,
        taskId,
        uploadedById: userId,
      },
    });
    uploadId = upload.id;
    await tx.analyzedDevice.create({
      data: {
        uploadId: upload.id,
        hostname: analysis.device.hostname ?? filename,
        vendor: analysis.device.vendor,
        model: analysis.device.model,
        firmware: analysis.device.firmware,
        findingsAgg: J({ critical: sevAgg.critical, high: sevAgg.high, medium: sevAgg.medium }),
      },
    });
    await tx.aiAnalysisResult.create({
      data: {
        uploadId: upload.id,
        scope: "config",
        model,
        input: `config:${filename}`,
        output: r.raw,
        latencyMs: r.latencyMs,
        tokens: r.tokens,
        ok: true,
        createdById: userId,
      },
    });
    await tx.auditLog.create({
      data: {
        userId,
        action: "config.upload",
        entity: upload.id,
        level: "info",
        payload: J({
          filename,
          vendor: analysis.device.vendor,
          gapCount: analysis.gaps.length,
          auditId,
          taskId,
        }),
      },
    });
    await emitKpiEvent(tx, {
      userId,
      ruleCode: "config_analysis",
      points: 5,
      auditId,
      payload: { filename, vendor: analysis.device.vendor },
    });
  });

  revalidatePath("/analysis/config");
  return {
    ok: true,
    uploadId,
    vendor: analysis.device.vendor,
    filename,
    gapCount: analysis.gaps.length,
    analysis,
  };
}

export interface ReanalyzeConfigResult {
  ok: boolean;
  error?: string;
  analysis?: ConfigAnalysis;
}

/** Re-run the AI analyzer on a stored upload, refresh aggregates, and record it. */
export async function reanalyzeConfig(input: { uploadId: string }): Promise<ReanalyzeConfigResult> {
  const uploadId = z.string().min(1).safeParse(input?.uploadId);
  if (!uploadId.success) return { ok: false, error: "invalid" };

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "config.upload"))) return { ok: false, error: "forbidden" };

  const upload = await prisma.configUpload.findUnique({ where: { id: uploadId.data } });
  if (!upload) return { ok: false, error: "not_found" };

  const r = await analyzeConfigAI(upload.filename, upload.content);
  if (!r.ok || !r.analysis) return { ok: false, error: "ai_unavailable" };
  const analysis = r.analysis;
  const sevAgg = severityAgg(analysis);
  const { model } = getOllamaConfig();

  await prisma.$transaction(async (tx) => {
    await tx.configUpload.update({
      where: { id: upload.id },
      data: {
        vendor: analysis.device.vendor,
        gapCount: analysis.gaps.length,
        severityAgg: J(sevAgg),
      },
    });
    await tx.analyzedDevice.updateMany({
      where: { uploadId: upload.id },
      data: {
        hostname: analysis.device.hostname ?? upload.filename,
        vendor: analysis.device.vendor,
        model: analysis.device.model,
        firmware: analysis.device.firmware,
        findingsAgg: J({ critical: sevAgg.critical, high: sevAgg.high, medium: sevAgg.medium }),
      },
    });
    await tx.aiAnalysisResult.create({
      data: {
        uploadId: upload.id,
        scope: "config",
        model,
        input: `config:${upload.filename}`,
        output: r.raw,
        latencyMs: r.latencyMs,
        tokens: r.tokens,
        ok: true,
        createdById: userId,
      },
    });
    await tx.auditLog.create({
      data: {
        userId,
        action: "config.reanalyze",
        entity: upload.id,
        level: "info",
        payload: J({ filename: upload.filename, gapCount: analysis.gaps.length }),
      },
    });
  });

  revalidatePath("/analysis/config");
  return { ok: true, analysis };
}

const DraftsInput = z.object({
  uploadId: z.string().min(1),
  gapIndices: z.array(z.number().int().nonnegative()).optional(),
});

export interface CreateDraftsResult {
  ok: boolean;
  error?: string;
  ids?: string[];
}

/**
 * Materialize the AI-detected gaps of a stored upload as draft Findings. Gaps are
 * read from the latest persisted analysis (not re-derived) so drafts are stable
 * and idempotent. Reuses the finding-creation contract.
 */
export async function createConfigDrafts(
  input: z.input<typeof DraftsInput>,
): Promise<CreateDraftsResult> {
  const parsed = DraftsInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { uploadId, gapIndices } = parsed.data;

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "config.upload"))) return { ok: false, error: "forbidden" };

  const upload = await prisma.configUpload.findUnique({ where: { id: uploadId } });
  if (!upload) return { ok: false, error: "not_found" };

  const ai = await prisma.aiAnalysisResult.findFirst({
    where: { uploadId, scope: "config", ok: true },
    orderBy: { createdAt: "desc" },
  });
  const analysis = parseConfigAnalysis(ai?.output);
  if (!analysis) return { ok: false, error: "no_analysis" };

  let gaps = analysis.gaps;
  if (gapIndices?.length) gaps = gapIndices.map((i) => gaps[i]).filter(Boolean);
  if (gaps.length === 0) return { ok: false, error: "no_gaps" };

  const asset = analysis.device.hostname ?? upload.filename;
  const inputs: FindingRowInput[] = gaps.map((g) => ({
    ...gapToFindingInput(g, { auditId: upload.auditId, taskId: upload.taskId, asset }),
    ai: true,
  }));

  const ids = await materializeFindings(userId, inputs, "config");

  await prisma.auditLog.create({
    data: {
      userId,
      action: "config.create_drafts",
      entity: uploadId,
      level: "info",
      payload: J({ uploadId, count: ids.length, findingIds: ids }),
    },
  });

  revalidatePath("/findings");
  revalidatePath("/dashboard");
  revalidatePath("/analysis/config");
  revalidatePath(`/audits/${upload.auditId}`);
  return { ok: true, ids };
}
