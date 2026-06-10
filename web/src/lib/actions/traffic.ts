"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canView } from "@/lib/rbac";
import { emitKpiEvent } from "@/lib/kpi-engine";
import { analyzeTraffic, trafficAnomalyToFindingInput } from "@/lib/analysis/traffic";
import type { AnomalySeverity } from "@/lib/analysis/traffic";
import { materializeFindings, type FindingRowInput } from "./findings";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));
const MAX_BYTES = 10 * 1024 * 1024;

const UploadInput = z.object({
  filename: z.string().min(1).max(256),
  content: z.string().min(1),
  auditId: z.string().min(1),
  taskId: z.string().min(1),
});

export interface UploadTrafficResult {
  ok: boolean;
  error?: string;
  uploadId?: string;
  format?: string;
  anomalyCount?: number;
}

export async function uploadTrafficFile(
  input: z.input<typeof UploadInput>,
): Promise<UploadTrafficResult> {
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

  const result = analyzeTraffic(filename, content);
  const sevAgg: Record<AnomalySeverity, number> = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  for (const a of result.anomalies) sevAgg[a.severity]++;

  let uploadId = "";
  await prisma.$transaction(async (tx) => {
    const upload = await tx.trafficUpload.create({
      data: {
        filename, format: result.format, content, sizeBytes,
        anomalyCount: result.anomalies.length,
        severityAgg: J(sevAgg),
        totalPackets: result.totalPackets,
        uniqueIps: result.uniqueIps,
        auditId, taskId, uploadedById: userId,
      },
    });
    uploadId = upload.id;
    await tx.auditLog.create({
      data: {
        userId, action: "traffic.import", entity: upload.id, level: "info",
        payload: J({ filename, format: result.format, anomalyCount: result.anomalies.length, auditId, taskId }),
      },
    });
    await emitKpiEvent(tx, {
      userId, ruleCode: "traffic_import", points: 5, auditId,
      payload: { filename, format: result.format },
    });
  });

  revalidatePath("/analysis/traffic");
  return { ok: true, uploadId, format: result.format, anomalyCount: result.anomalies.length };
}

const DraftsInput = z.object({ uploadId: z.string().min(1) });

export interface CreateTrafficDraftsResult {
  ok: boolean;
  error?: string;
  ids?: string[];
}

export async function createTrafficDrafts(
  input: z.input<typeof DraftsInput>,
): Promise<CreateTrafficDraftsResult> {
  const parsed = DraftsInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { uploadId } = parsed.data;

  const { userId, role } = await requireSession();
  if (!canView(role, "config")) return { ok: false, error: "forbidden" };

  const upload = await prisma.trafficUpload.findUnique({ where: { id: uploadId } });
  if (!upload) return { ok: false, error: "not_found" };

  const result = analyzeTraffic(upload.filename, upload.content);
  if (result.anomalies.length === 0) return { ok: false, error: "no_anomalies" };

  const inputs: FindingRowInput[] = result.anomalies.map((a) =>
    trafficAnomalyToFindingInput(a, { auditId: upload.auditId, taskId: upload.taskId }),
  );

  const ids = await materializeFindings(userId, inputs, "traffic");

  await prisma.auditLog.create({
    data: {
      userId, action: "traffic.create_drafts", entity: uploadId, level: "info",
      payload: J({ uploadId, count: ids.length, findingIds: ids }),
    },
  });

  revalidatePath("/findings");
  revalidatePath("/dashboard");
  revalidatePath("/analysis/traffic");
  revalidatePath(`/audits/${upload.auditId}`);
  return { ok: true, ids };
}
