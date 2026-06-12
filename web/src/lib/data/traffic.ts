import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { parseTrafficAnalysis, type TrafficAiAnalysis } from "@/lib/ai/prompts";
import type { TrafficUploadView, TrafficHistoryRowView } from "@/lib/types/entities";

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

/** Last 20 traffic uploads — drives the history panel. */
export const getRecentTrafficUploads = cache(async (): Promise<TrafficHistoryRowView[]> => {
  const rows = await prisma.trafficUpload.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
    include: { audit: { select: { code: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    filename: r.filename,
    format: r.format,
    auditCode: r.audit.code,
    anomalyCount: r.anomalyCount,
    totalPackets: r.totalPackets,
    uniqueIps: r.uniqueIps,
    createdAt: r.createdAt.toISOString(),
  }));
});

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
