import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type {
  Finding,
  FindingEvidenceView,
  FindingStatus,
  Severity,
} from "@/lib/types/entities";

type Row = {
  id: string;
  auditId: string;
  taskId: string;
  title: string;
  severity: string;
  cvss: number;
  status: string;
  reportedById: string;
  date: string;
  asset: string;
  type: string;
  cwe: string;
  description: string;
  evidence: number;
  ai: boolean;
};

function toFinding(f: Row): Finding {
  return {
    id: f.id,
    auditId: f.auditId,
    taskId: f.taskId,
    title: f.title,
    severity: f.severity as Severity,
    cvss: f.cvss,
    status: f.status as FindingStatus,
    reportedBy: f.reportedById,
    date: f.date,
    asset: f.asset,
    type: f.type,
    cwe: f.cwe,
    description: f.description,
    evidence: f.evidence,
    ai: f.ai,
  };
}

export const getFindings = cache(
  async (): Promise<Finding[]> =>
    // Stable order (fixture id order) — deterministic across status updates.
    (await prisma.finding.findMany({ orderBy: { id: "asc" } })).map(toFinding),
);

export const getFindingsByAudit = cache(
  async (auditId: string): Promise<Finding[]> =>
    (await prisma.finding.findMany({ where: { auditId } })).map(toFinding),
);

export const getFindingsByTask = cache(
  async (taskId: string): Promise<Finding[]> =>
    (await prisma.finding.findMany({ where: { taskId } })).map(toFinding),
);

export const getFindingEvidenceMap = cache(async (): Promise<Record<string, FindingEvidenceView[]>> => {
  const rows = await prisma.findingEvidence.findMany({
    include: { file: true },
    orderBy: { createdAt: "asc" },
  });
  const map: Record<string, FindingEvidenceView[]> = {};
  for (const row of rows) {
    const bytes = row.file.bytes ? Buffer.from(row.file.bytes).toString("base64") : "";
    const item: FindingEvidenceView = {
      id: row.id,
      findingId: row.findingId,
      filename: row.file.filename,
      mimeType: row.file.mimeType,
      sizeBytes: row.file.sizeBytes,
      dataUrl: `data:${row.file.mimeType};base64,${bytes}`,
      kind: row.kind,
      createdAt: row.createdAt.toISOString(),
    };
    map[row.findingId] = [...(map[row.findingId] ?? []), item];
  }
  return map;
});
