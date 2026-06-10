import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { TrafficUploadView } from "@/lib/types/entities";

function toView(u: {
  id: string; filename: string; format: string; content: string;
  auditId: string; taskId: string; anomalyCount: number;
  totalPackets: number; uniqueIps: number; createdAt: Date;
}): TrafficUploadView {
  return {
    id: u.id, filename: u.filename, format: u.format, content: u.content,
    auditId: u.auditId, taskId: u.taskId, anomalyCount: u.anomalyCount,
    totalPackets: u.totalPackets, uniqueIps: u.uniqueIps,
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
