"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { emitKpiEvent } from "@/lib/kpi-engine";
import { analyzeScanner, scannerFindingToFindingInput } from "@/lib/analysis/scanner";
import { normalizedFindingToFindingInput } from "@/lib/analysis/scanner/to-finding";
import { normalizeScannerAI } from "@/lib/analysis/scanner/ai";
import type { ScannerSeverity, ScannerNormalization } from "@/lib/analysis/scanner";
import { parseScannerNormalization } from "@/lib/ai/prompts";
import { isAuditMember } from "@/lib/audit-access";
import { materializeFindings, type FindingRowInput } from "./findings";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const UploadInput = z.object({
  filename: z.string().min(1).max(256),
  content: z.string().min(1),
  auditId: z.string().min(1),
  taskId: z.string().min(1),
});

export interface UploadScannerResult {
  ok: boolean;
  error?: string;
  uploadId?: string;
  scanner?: string;
  findingCount?: number;
  ai?: ScannerNormalization | null;
  aiOk?: boolean;
}

export async function uploadScannerFile(
  input: z.input<typeof UploadInput>,
): Promise<UploadScannerResult> {
  const parsed = UploadInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { filename, content, auditId, taskId } = parsed.data;

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "scanner.import")))
    return { ok: false, error: "forbidden" };

  const sizeBytes = Buffer.byteLength(content, "utf8");
  if (sizeBytes > MAX_BYTES) return { ok: false, error: "too_large" };

  const audit = await prisma.audit.findUnique({ where: { id: auditId }, select: { id: true } });
  if (!audit) return { ok: false, error: "not_found" };
  if (!(await isAuditMember(auditId, userId))) return { ok: false, error: "forbidden" };
  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { auditId: true } });
  if (!task) return { ok: false, error: "not_found" };
  if (task.auditId !== auditId) return { ok: false, error: "task_mismatch" };

  const result = analyzeScanner(filename, content);
  const sevAgg: Record<ScannerSeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };
  for (const f of result.findings) sevAgg[f.severity]++;

  // AI normalization layer — graceful: a down model keeps the raw parsed findings.
  const ai = await normalizeScannerAI(result.scanner, result.findings);

  let uploadId = "";
  await prisma.$transaction(async (tx) => {
    const upload = await tx.scannerUpload.create({
      data: {
        filename,
        scanner: result.scanner,
        content,
        sizeBytes,
        findingCount: result.findings.length,
        severityAgg: J(sevAgg),
        aiResult: ai.ok && ai.normalization ? JSON.stringify(ai.normalization) : null,
        aiOk: ai.ok,
        auditId,
        taskId,
        uploadedById: userId,
      },
    });
    uploadId = upload.id;
    await tx.auditLog.create({
      data: {
        userId,
        action: "scanner.import",
        entity: upload.id,
        level: "info",
        payload: J({
          filename,
          scanner: result.scanner,
          findingCount: result.findings.length,
          aiOk: ai.ok,
          auditId,
          taskId,
        }),
      },
    });
    await emitKpiEvent(tx, {
      userId,
      ruleCode: "scanner_import",
      points: 5,
      auditId,
      payload: { filename, scanner: result.scanner },
    });
  });

  revalidatePath("/analysis/scanner");
  return {
    ok: true,
    uploadId,
    scanner: result.scanner,
    findingCount: result.findings.length,
    ai: ai.ok ? (ai.normalization ?? null) : null,
    aiOk: ai.ok,
  };
}

export interface ReanalyzeScannerResult {
  ok: boolean;
  error?: string;
  normalization?: ScannerNormalization;
}

/** Re-run the AI normalization on a stored upload, refresh aiResult, record it. */
export async function reanalyzeScanner(input: {
  uploadId: string;
}): Promise<ReanalyzeScannerResult> {
  const uploadId = z.string().min(1).safeParse(input?.uploadId);
  if (!uploadId.success) return { ok: false, error: "invalid" };

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "scanner.import")))
    return { ok: false, error: "forbidden" };

  const upload = await prisma.scannerUpload.findUnique({ where: { id: uploadId.data } });
  if (!upload) return { ok: false, error: "not_found" };
  if (!(await isAuditMember(upload.auditId, userId))) return { ok: false, error: "forbidden" };

  const result = analyzeScanner(upload.filename, upload.content);
  const ai = await normalizeScannerAI(result.scanner, result.findings);
  if (!ai.ok || !ai.normalization) return { ok: false, error: "ai_unavailable" };

  await prisma.scannerUpload.update({
    where: { id: upload.id },
    data: { aiResult: JSON.stringify(ai.normalization), aiOk: true },
  });
  await prisma.auditLog.create({
    data: {
      userId,
      action: "scanner.reanalyze",
      entity: upload.id,
      level: "info",
      payload: J({ filename: upload.filename, normalizedCount: ai.normalization.normalizedCount }),
    },
  });

  revalidatePath("/analysis/scanner");
  return { ok: true, normalization: ai.normalization };
}

const DraftsInput = z.object({
  uploadId: z.string().min(1),
  findingIndices: z.array(z.number().int().nonnegative()).optional(),
});

export interface CreateScannerDraftsResult {
  ok: boolean;
  error?: string;
  ids?: string[];
}

export async function createScannerDrafts(
  input: z.input<typeof DraftsInput>,
): Promise<CreateScannerDraftsResult> {
  const parsed = DraftsInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { uploadId, findingIndices } = parsed.data;

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "scanner.import")))
    return { ok: false, error: "forbidden" };

  const upload = await prisma.scannerUpload.findUnique({ where: { id: uploadId } });
  if (!upload) return { ok: false, error: "not_found" };
  if (!(await isAuditMember(upload.auditId, userId))) return { ok: false, error: "forbidden" };

  const asset = upload.filename.replace(/\.[^.]+$/, "") || upload.filename;
  const ctx = { auditId: upload.auditId, taskId: upload.taskId, asset };

  // Prefer the AI-normalized (deduped) findings; fall back to the raw parse.
  const normalization = upload.aiOk ? parseScannerNormalization(upload.aiResult) : null;
  let inputs: FindingRowInput[];
  if (normalization) {
    let findings = normalization.findings;
    if (findingIndices?.length) findings = findingIndices.map((i) => findings[i]).filter(Boolean);
    if (findings.length === 0) return { ok: false, error: "no_findings" };
    inputs = findings.map((f) => normalizedFindingToFindingInput(f, ctx));
  } else {
    let findings = analyzeScanner(upload.filename, upload.content).findings;
    if (findingIndices?.length) findings = findingIndices.map((i) => findings[i]).filter(Boolean);
    if (findings.length === 0) return { ok: false, error: "no_findings" };
    inputs = findings.map((f) => scannerFindingToFindingInput(f, ctx));
  }

  const ids = await materializeFindings(userId, inputs, "scanner");

  await prisma.auditLog.create({
    data: {
      userId,
      action: "scanner.create_drafts",
      entity: uploadId,
      level: "info",
      payload: J({ uploadId, count: ids.length, findingIds: ids }),
    },
  });

  revalidatePath("/findings");
  revalidatePath("/dashboard");
  revalidatePath("/analysis/scanner");
  revalidatePath(`/audits/${upload.auditId}`);
  return { ok: true, ids };
}
