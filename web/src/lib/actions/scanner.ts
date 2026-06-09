"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canView } from "@/lib/rbac";
import { emitKpiEvent } from "@/lib/kpi-engine";
import { analyzeScanner, scannerFindingToFindingInput } from "@/lib/analysis/scanner";
import type { ScannerSeverity } from "@/lib/analysis/scanner";
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
}

export async function uploadScannerFile(
  input: z.input<typeof UploadInput>,
): Promise<UploadScannerResult> {
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

  const result = analyzeScanner(filename, content);
  const sevAgg: Record<ScannerSeverity, number> = {
    critical: 0, high: 0, medium: 0, low: 0, info: 0,
  };
  for (const f of result.findings) sevAgg[f.severity]++;

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
        payload: J({ filename, scanner: result.scanner, findingCount: result.findings.length, auditId, taskId }),
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
  return { ok: true, uploadId, scanner: result.scanner, findingCount: result.findings.length };
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

  const { userId, role } = await requireSession();
  if (!canView(role, "config")) return { ok: false, error: "forbidden" };

  const upload = await prisma.scannerUpload.findUnique({ where: { id: uploadId } });
  if (!upload) return { ok: false, error: "not_found" };

  const result = analyzeScanner(upload.filename, upload.content);
  let findings = result.findings;
  if (findingIndices?.length) findings = findingIndices.map((i) => findings[i]).filter(Boolean);
  if (findings.length === 0) return { ok: false, error: "no_findings" };

  const asset = upload.filename.replace(/\.[^.]+$/, "") || upload.filename;
  const inputs: FindingRowInput[] = findings.map((f) =>
    scannerFindingToFindingInput(f, { auditId: upload.auditId, taskId: upload.taskId, asset }),
  );

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
