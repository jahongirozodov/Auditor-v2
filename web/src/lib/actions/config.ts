"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canView } from "@/lib/rbac";
import { emitKpiEvent } from "@/lib/kpi-engine";
import { analyzeConfig } from "@/lib/analysis/config";
import { gapToFindingInput } from "@/lib/analysis/config/to-finding";
import type { GapSeverity } from "@/lib/analysis/config";
import { materializeFindings, type FindingRowInput } from "./findings";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB — configs are small text files

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
}

/**
 * Upload + analyze a device config: validate, RBAC-gate, parse for gaps, persist
 * the upload + analyzed device, append the audit log, and credit the analyst KPI.
 * The raw text is stored so gaps can be re-derived deterministically for drafts.
 */
export async function uploadConfig(
  input: z.input<typeof UploadInput>,
): Promise<UploadConfigResult> {
  const parsed = UploadInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { filename, content, auditId, taskId } = parsed.data;

  const { userId, role } = await requireSession();
  if (!canView(role, "config")) return { ok: false, error: "forbidden" };

  const sizeBytes = Buffer.byteLength(content, "utf8");
  if (sizeBytes > MAX_BYTES) return { ok: false, error: "too_large" };

  const audit = await prisma.audit.findUnique({ where: { id: auditId }, select: { id: true } });
  if (!audit) return { ok: false, error: "not_found" };
  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { auditId: true } });
  if (!task) return { ok: false, error: "not_found" };
  if (task.auditId !== auditId) return { ok: false, error: "task_mismatch" };

  const result = analyzeConfig(filename, content);
  const sevAgg: Record<GapSeverity, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const g of result.gaps) sevAgg[g.severity]++;

  let uploadId = "";
  await prisma.$transaction(async (tx) => {
    const upload = await tx.configUpload.create({
      data: {
        filename,
        vendor: result.vendor,
        content,
        sizeBytes,
        gapCount: result.gaps.length,
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
        hostname: result.hostname ?? filename,
        vendor: result.vendor,
        model: result.model,
        firmware: result.firmware,
        findingsAgg: J({ critical: sevAgg.critical, high: sevAgg.high, medium: sevAgg.medium }),
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
          vendor: result.vendor,
          gapCount: result.gaps.length,
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
      payload: { filename, vendor: result.vendor },
    });
  });

  revalidatePath("/analysis/config");
  return { ok: true, uploadId, vendor: result.vendor, filename, gapCount: result.gaps.length };
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
 * Materialize the detected gaps of a stored upload as draft Findings (status "new").
 * Gaps are re-derived from the stored text; the latest successful AI note (if any)
 * is woven into each draft's description. Reuses the finding-creation contract.
 */
export async function createConfigDrafts(
  input: z.input<typeof DraftsInput>,
): Promise<CreateDraftsResult> {
  const parsed = DraftsInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { uploadId, gapIndices } = parsed.data;

  const { userId, role } = await requireSession();
  if (!canView(role, "config")) return { ok: false, error: "forbidden" };

  const upload = await prisma.configUpload.findUnique({ where: { id: uploadId } });
  if (!upload) return { ok: false, error: "not_found" };

  const ai = await prisma.aiAnalysisResult.findFirst({
    where: { uploadId, ok: true },
    orderBy: { createdAt: "desc" },
  });

  const result = analyzeConfig(upload.filename, upload.content);
  let gaps = result.gaps;
  if (gapIndices?.length) gaps = gapIndices.map((i) => gaps[i]).filter(Boolean);
  if (gaps.length === 0) return { ok: false, error: "no_gaps" };

  const asset = result.hostname ?? upload.filename;
  const inputs: FindingRowInput[] = gaps.map((g) => ({
    ...gapToFindingInput(g, {
      auditId: upload.auditId,
      taskId: upload.taskId,
      asset,
      aiNote: ai?.output || undefined,
    }),
    ai: Boolean(ai?.ok),
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
