"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { emitKpiEvent } from "@/lib/kpi-engine";
import { analyzeTraffic, trafficAnomalyToFindingInput } from "@/lib/analysis/traffic";
import type { AnomalySeverity, TrafficParseResult } from "@/lib/analysis/traffic";
import { parsePcap } from "@/lib/analysis/traffic/parsers/pcap";
import { analyzeTrafficAI } from "@/lib/analysis/traffic/ai";
import { parseTrafficAnalysis, type TrafficAiAnalysis } from "@/lib/ai/prompts";
import { isAuditMember } from "@/lib/audit-access";
import { materializeFindings, type FindingRowInput } from "./findings";

const isPcapName = (name: string): boolean => /\.(pcap|pcapng)$/i.test(name);

/**
 * Re-derive the parse result for a stored upload: binary (pcap) uploads keep their
 * structured result in `parsed`; text uploads are re-parsed from `content`.
 */
function resultFromStored(u: {
  filename: string;
  content: string;
  parsed: string | null;
}): TrafficParseResult {
  if (u.parsed) {
    try {
      return JSON.parse(u.parsed) as TrafficParseResult;
    } catch {
      /* fall through to text parse */
    }
  }
  return analyzeTraffic(u.filename, u.content);
}

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
  ai?: TrafficAiAnalysis | null;
  /** The parse result — the client renders this directly (esp. for binary pcap). */
  result?: TrafficParseResult;
}

export async function uploadTrafficFile(
  input: z.input<typeof UploadInput>,
): Promise<UploadTrafficResult> {
  const parsed = UploadInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { filename, content, auditId, taskId } = parsed.data;

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "traffic.upload"))) return { ok: false, error: "forbidden" };

  // Binary pcap arrives base64-encoded and is parsed server-side into a structured
  // result (stored in `parsed`). Text formats keep raw content (NUL-stripped for
  // Postgres) and are re-derived on the client.
  const pcap = isPcapName(filename);
  let result: TrafficParseResult;
  let storedContent: string;
  let parsedJson: string | null = null;
  let sizeBytes: number;

  if (pcap) {
    const bytes = Buffer.from(content, "base64");
    sizeBytes = bytes.length;
    if (sizeBytes > MAX_BYTES) return { ok: false, error: "too_large" };
    result = parsePcap(new Uint8Array(bytes));
    storedContent = ""; // raw bytes are discarded after parsing
    parsedJson = JSON.stringify(result);
  } else {
    sizeBytes = Buffer.byteLength(content, "utf8");
    if (sizeBytes > MAX_BYTES) return { ok: false, error: "too_large" };
    // Postgres text columns reject NUL (0x00) — strip them so the insert never
    // fails with encoding error 22021.
    storedContent = content.split(String.fromCharCode(0)).join("");
    result = analyzeTraffic(filename, storedContent);
  }

  const audit = await prisma.audit.findUnique({ where: { id: auditId }, select: { id: true } });
  if (!audit) return { ok: false, error: "not_found" };
  if (!(await isAuditMember(auditId, userId))) return { ok: false, error: "forbidden" };
  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { auditId: true } });
  if (!task) return { ok: false, error: "not_found" };
  if (task.auditId !== auditId) return { ok: false, error: "task_mismatch" };

  const sevAgg: Record<AnomalySeverity, number> = {
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
    info: 0,
  };
  for (const a of result.anomalies) sevAgg[a.severity]++;

  // AI analysis — hard dependency (config-style): a down model blocks the import.
  const ai = await analyzeTrafficAI(filename, result);
  if (!ai.ok || !ai.analysis) return { ok: false, error: "ai_unreachable" };

  let uploadId = "";
  await prisma.$transaction(async (tx) => {
    const upload = await tx.trafficUpload.create({
      data: {
        filename,
        format: result.format,
        content: storedContent,
        parsed: parsedJson,
        sizeBytes,
        anomalyCount: result.anomalies.length,
        severityAgg: J(sevAgg),
        totalPackets: result.totalPackets,
        uniqueIps: result.uniqueIps,
        aiResult: JSON.stringify(ai.analysis),
        aiOk: true,
        auditId,
        taskId,
        uploadedById: userId,
      },
    });
    uploadId = upload.id;
    await tx.auditLog.create({
      data: {
        userId,
        action: "traffic.import",
        entity: upload.id,
        level: "info",
        payload: J({
          filename,
          format: result.format,
          anomalyCount: result.anomalies.length,
          auditId,
          taskId,
        }),
      },
    });
    await emitKpiEvent(tx, {
      userId,
      ruleCode: "traffic_import",
      points: 5,
      auditId,
      payload: { filename, format: result.format },
    });
  });

  revalidatePath("/analysis/traffic");
  return {
    ok: true,
    uploadId,
    format: result.format,
    anomalyCount: result.anomalies.length,
    ai: ai.analysis,
    result,
  };
}

export interface ReanalyzeTrafficResult {
  ok: boolean;
  error?: string;
  analysis?: TrafficAiAnalysis;
}

/** Re-run the AI analysis on a stored upload, refresh aiResult, record it. */
export async function reanalyzeTraffic(input: {
  uploadId: string;
}): Promise<ReanalyzeTrafficResult> {
  const parsed = z.string().min(1).safeParse(input?.uploadId);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "traffic.upload"))) return { ok: false, error: "forbidden" };

  const upload = await prisma.trafficUpload.findUnique({ where: { id: parsed.data } });
  if (!upload) return { ok: false, error: "not_found" };
  if (!(await isAuditMember(upload.auditId, userId))) return { ok: false, error: "forbidden" };

  const result = resultFromStored(upload);
  const ai = await analyzeTrafficAI(upload.filename, result);
  if (!ai.ok || !ai.analysis) return { ok: false, error: "ai_unreachable" };

  await prisma.trafficUpload.update({
    where: { id: upload.id },
    data: { aiResult: JSON.stringify(ai.analysis), aiOk: true },
  });
  await prisma.auditLog.create({
    data: {
      userId,
      action: "traffic.reanalyze",
      entity: upload.id,
      level: "info",
      payload: J({ filename: upload.filename, anomalies: ai.analysis.anomalies.length }),
    },
  });

  revalidatePath("/analysis/traffic");
  return { ok: true, analysis: ai.analysis };
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

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "traffic.upload"))) return { ok: false, error: "forbidden" };

  const upload = await prisma.trafficUpload.findUnique({ where: { id: uploadId } });
  if (!upload) return { ok: false, error: "not_found" };
  if (!(await isAuditMember(upload.auditId, userId))) return { ok: false, error: "forbidden" };

  const result = resultFromStored(upload);
  if (result.anomalies.length === 0) return { ok: false, error: "no_anomalies" };

  // Enrich each draft with the stored AI recommendation (matched by parser order).
  const ai = parseTrafficAnalysis(upload.aiResult);
  const inputs: FindingRowInput[] = result.anomalies.map((a, i) => {
    const base = trafficAnomalyToFindingInput(a, { auditId: upload.auditId, taskId: upload.taskId });
    const rec = ai?.anomalies[i]?.recommendation?.trim();
    return rec ? { ...base, description: `${base.description}. Tavsiya: ${rec}`, ai: true } : base;
  });

  const ids = await materializeFindings(userId, inputs, "traffic");

  await prisma.auditLog.create({
    data: {
      userId,
      action: "traffic.create_drafts",
      entity: uploadId,
      level: "info",
      payload: J({ uploadId, count: ids.length, findingIds: ids }),
    },
  });

  revalidatePath("/findings");
  revalidatePath("/dashboard");
  revalidatePath("/analysis/traffic");
  revalidatePath(`/audits/${upload.auditId}`);
  return { ok: true, ids };
}
