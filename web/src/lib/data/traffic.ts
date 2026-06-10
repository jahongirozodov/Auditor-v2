import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { parseTrafficAnalysis, type TrafficAiAnalysis } from "@/lib/ai/prompts";
import type { TrafficUploadView } from "@/lib/types/entities";

function toView(u: {
  id: string;
  filename: string;
  format: string;
  content: string;
  parsed: string | null;
  auditId: string;
  taskId: string;
  anomalyCount: number;
  totalPackets: number;
  uniqueIps: number;
  createdAt: Date;
}): TrafficUploadView {
  return {
    id: u.id,
    filename: u.filename,
    format: u.format,
    content: u.content,
    parsed: u.parsed,
    auditId: u.auditId,
    taskId: u.taskId,
    anomalyCount: u.anomalyCount,
    totalPackets: u.totalPackets,
    uniqueIps: u.uniqueIps,
    createdAt: u.createdAt.toISOString(),
  };
}

/** Most recent traffic upload — raw content for client-side re-derive. */
export const getLatestTrafficUpload = cache(async (): Promise<TrafficUploadView | null> => {
  const u = await prisma.trafficUpload.findFirst({ orderBy: { createdAt: "desc" } });
  return u ? toView(u) : null;
});

/** Single upload by id. */
export const getTrafficUpload = cache(async (id: string): Promise<TrafficUploadView | null> => {
  const u = await prisma.trafficUpload.findUnique({ where: { id } });
  return u ? toView(u) : null;
});

/** Stored structured AI analysis for an upload — hydrates the screen on load. */
export const getLatestTrafficAi = cache(
  async (uploadId: string): Promise<TrafficAiAnalysis | null> => {
    const u = await prisma.trafficUpload.findUnique({
      where: { id: uploadId },
      select: { aiResult: true, aiOk: true },
    });
    return u?.aiOk ? parseTrafficAnalysis(u.aiResult) : null;
  },
);
