import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { AnalyzedDeviceView, ConfigUploadView } from "@/lib/types/entities";
import { parseConfigAnalysis, type ConfigAiAnalysis } from "@/lib/ai/prompts";

type Agg3 = { critical?: number; high?: number; medium?: number };

type UploadRow = {
  id: string;
  filename: string;
  vendor: string;
  content: string;
  auditId: string;
  taskId: string;
  createdAt: Date;
};

function toUploadView(u: UploadRow): ConfigUploadView {
  return {
    id: u.id,
    filename: u.filename,
    vendor: u.vendor,
    content: u.content,
    auditId: u.auditId,
    taskId: u.taskId,
    createdAt: u.createdAt.toISOString(),
  };
}

/** Persisted analyzed devices, newest first — drives the devices panel. */
export const getAnalyzedDevices = cache(async (): Promise<AnalyzedDeviceView[]> => {
  const rows = await prisma.analyzedDevice.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return rows.map((d) => {
    const f = (d.findingsAgg as Agg3 | null) ?? {};
    return {
      id: d.id,
      uploadId: d.uploadId,
      hostname: d.hostname,
      vendor: d.vendor,
      model: d.model,
      firmware: d.firmware,
      findings: { critical: f.critical ?? 0, high: f.high ?? 0, medium: f.medium ?? 0 },
    };
  });
});

/** Most recent upload — its raw text is re-parsed client-side for the preview. */
export const getLatestConfigUpload = cache(async (): Promise<ConfigUploadView | null> => {
  const u = await prisma.configUpload.findFirst({ orderBy: { createdAt: "desc" } });
  return u ? toUploadView(u) : null;
});

/** A single upload by id (used server-side to re-derive gaps for draft creation). */
export const getConfigUpload = cache(async (id: string): Promise<ConfigUploadView | null> => {
  const u = await prisma.configUpload.findUnique({ where: { id } });
  return u ? toUploadView(u) : null;
});

/** Latest successful structured AI analysis for an upload — hydrates the screen on load. */
export const getLatestConfigAi = cache(
  async (uploadId: string): Promise<ConfigAiAnalysis | null> => {
    const row = await prisma.aiAnalysisResult.findFirst({
      where: { uploadId, scope: "config", ok: true },
      orderBy: { createdAt: "desc" },
      select: { output: true },
    });
    return parseConfigAnalysis(row?.output);
  },
);
