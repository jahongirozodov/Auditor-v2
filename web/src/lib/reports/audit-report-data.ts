import "server-only";
import { prisma } from "@/lib/prisma";
import { parseAuditAnalysis } from "@/lib/ai/prompts";
import type { AuditAnalysis } from "@/lib/analysis/audit/types";

export interface AuditReportData {
  audit: {
    code: string;
    title: string;
    org: string;
    type: string;
    status: string;
    stage: number;
    startDate: string;
    endDate: string;
    leader: string;
    findings: { critical: number; high: number; medium: number; low: number };
    tasks: { total: number; done: number; in_progress: number; blocked: number; new: number };
  };
  members: { name: string; title: string }[];
  findings: { title: string; severity: string; asset: string; cwe: string; status: string }[];
  ai: AuditAnalysis | null;
  topology: { summary: string; overallRisk: string } | null;
  evidence: { name: string; comment: string }[];
  kpi: {
    taskCompletion: number;
    findingResolution: number;
    findingTotal: number;
    findingResolved: number;
  };
}

const APPROVED: ReadonlySet<string> = new Set(["approved", "fixing", "fixed", "retest", "closed"]);
const RESOLVED: ReadonlySet<string> = new Set(["fixed", "closed"]);
const num = (v: unknown): number => (typeof v === "number" ? v : 0);
const pct = (a: number, b: number): number => (b > 0 ? Math.round((a / b) * 100) : 0);

/**
 * Gather everything the audit report needs from the database in one place: audit
 * header, group, approved findings, the latest whole-audit AI analysis (executive
 * summary + remediation), topology summary, evidence, and computed KPI figures.
 * Returns null when the audit does not exist.
 */
export async function gatherAuditReportData(auditId: string): Promise<AuditReportData | null> {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    select: {
      code: true,
      title: true,
      type: true,
      status: true,
      stage: true,
      startDate: true,
      endDate: true,
      findings: true,
      tasksAgg: true,
      org: { select: { name: true } },
      leader: { select: { name: true } },
      members: { select: { user: { select: { name: true, title: true } } } },
    },
  });
  if (!audit) return null;

  const findingRows = await prisma.finding.findMany({
    where: { auditId },
    select: { title: true, severity: true, asset: true, cwe: true, status: true },
    orderBy: { severity: "asc" },
  });
  const approved = findingRows.filter((f) => APPROVED.has(f.status));

  const aiRow = await prisma.auditAiAnalysis.findFirst({
    where: { auditId, ok: true },
    orderBy: { createdAt: "desc" },
    select: { output: true },
  });
  const ai = parseAuditAnalysis(aiRow?.output);

  const topoRow = await prisma.topologyAiAnalysis.findFirst({
    where: { auditId, ok: true },
    orderBy: { createdAt: "desc" },
    select: { output: true },
  });
  const topoParsed = topoRow?.output ? safeJson(topoRow.output) : null;
  const topology = topoParsed
    ? {
        summary: String(topoParsed.summary ?? ""),
        overallRisk: String(topoParsed.overallRisk ?? ""),
      }
    : null;

  const evidenceRows = await prisma.auditEvidence.findMany({
    where: { auditId },
    select: { comment: true, file: { select: { filename: true } } },
    orderBy: { createdAt: "desc" },
  });

  const fAgg = audit.findings as Record<string, number> | null;
  const tAgg = audit.tasksAgg as Record<string, number> | null;
  const findingTotal = findingRows.length;
  const findingResolved = findingRows.filter((f) => RESOLVED.has(f.status)).length;

  return {
    audit: {
      code: audit.code,
      title: audit.title,
      org: audit.org.name,
      type: audit.type,
      status: audit.status,
      stage: audit.stage,
      startDate: audit.startDate,
      endDate: audit.endDate,
      leader: audit.leader.name,
      findings: {
        critical: num(fAgg?.critical),
        high: num(fAgg?.high),
        medium: num(fAgg?.medium),
        low: num(fAgg?.low),
      },
      tasks: {
        total: num(tAgg?.total),
        done: num(tAgg?.done),
        in_progress: num(tAgg?.in_progress),
        blocked: num(tAgg?.blocked),
        new: num(tAgg?.new),
      },
    },
    members: audit.members.map((m) => ({ name: m.user.name, title: m.user.title })),
    findings: approved,
    ai,
    topology,
    evidence: evidenceRows.map((e) => ({ name: e.file.filename, comment: e.comment })),
    kpi: {
      taskCompletion: pct(num(tAgg?.done), num(tAgg?.total)),
      findingResolution: pct(findingResolved, findingTotal),
      findingTotal,
      findingResolved,
    },
  };
}

function safeJson(s: string): Record<string, unknown> | null {
  try {
    const v = JSON.parse(s);
    return v && typeof v === "object" ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
