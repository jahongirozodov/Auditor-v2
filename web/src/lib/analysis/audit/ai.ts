import "server-only";
import { prisma } from "@/lib/prisma";
import { generateJson } from "@/lib/ai/ollama";
import {
  SYSTEM,
  AUDIT_JSON_SCHEMA,
  buildAuditPrompt,
  parseAuditAnalysis,
  parseTopologyAnalysis,
} from "@/lib/ai/prompts";
import type { AuditAnalysis } from "./types";

const MAX_FINDINGS = 80;
const RANK: Record<string, number> = { critical: 5, high: 4, medium: 3, low: 2, info: 1 };

export interface AnalyzeAuditResult {
  ok: boolean;
  analysis?: AuditAnalysis;
  /** Why it failed: the audit has nothing to analyze vs the model was unreachable. */
  reason?: "no_data" | "ai_unavailable";
  raw: string;
  tokens: number;
  latencyMs: number;
}

/**
 * AI analysis of a whole audit: gathers the audit's findings + module AI signals
 * (config/scanner/topology) into a compact context and asks the model for an
 * executive summary, top risks, remediation plan, and KPI note. Never throws — an
 * empty audit or unreachable model resolves to `{ ok: false }`.
 */
export async function analyzeAuditAI(auditId: string): Promise<AnalyzeAuditResult> {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    select: { code: true, title: true, stage: true, status: true, findings: true, tasksAgg: true },
  });
  if (!audit) return { ok: false, reason: "no_data", raw: "", tokens: 0, latencyMs: 0 };

  const findingRows = await prisma.finding.findMany({
    where: { auditId },
    select: { severity: true, status: true, asset: true, cwe: true, title: true },
  });
  const findings = [...findingRows]
    .sort((a, b) => (RANK[b.severity] ?? 0) - (RANK[a.severity] ?? 0))
    .slice(0, MAX_FINDINGS);

  const config = await prisma.configUpload.findMany({
    where: { auditId },
    select: { vendor: true, gapCount: true, severityAgg: true },
  });
  const scanner = await prisma.scannerUpload.findMany({
    where: { auditId },
    select: { scanner: true, findingCount: true, severityAgg: true, aiOk: true },
  });
  const topoRow = await prisma.topologyAiAnalysis.findFirst({
    where: { auditId, ok: true },
    orderBy: { createdAt: "desc" },
    select: { output: true },
  });
  const topo = parseTopologyAnalysis(topoRow?.output);

  // Aggregate finding counts live on the Audit row even when no per-finding rows
  // are stored — fall back to them so the analysis still runs from the totals.
  const agg = audit.findings as Record<string, number> | null;
  const aggTotal = agg
    ? Object.values(agg).reduce((s, n) => s + (typeof n === "number" ? n : 0), 0)
    : 0;

  // Nothing at all to analyze (no rows, no modules, no aggregate) → skip the model.
  if (
    findings.length === 0 &&
    config.length === 0 &&
    scanner.length === 0 &&
    !topo &&
    aggTotal === 0
  ) {
    return { ok: false, reason: "no_data", raw: "", tokens: 0, latencyMs: 0 };
  }

  const context = {
    audit: { code: audit.code, title: audit.title, stage: audit.stage, status: audit.status },
    findingCounts: audit.findings,
    taskCounts: audit.tasksAgg,
    findings,
    config: config.map((c) => ({ vendor: c.vendor, gaps: c.gapCount, sev: c.severityAgg })),
    scanner: scanner.map((s) => ({
      scanner: s.scanner,
      findings: s.findingCount,
      sev: s.severityAgg,
      aiOk: s.aiOk,
    })),
    topology: topo ? { summary: topo.summary, overallRisk: topo.overallRisk } : undefined,
  };

  const prompt = `${SYSTEM.audit}\n\n${buildAuditPrompt(context)}`;
  const reply = await generateJson(prompt, AUDIT_JSON_SCHEMA, { numPredict: 4096 });
  const analysis = reply.ok ? parseAuditAnalysis(reply.raw) : null;
  if (!analysis) {
    return {
      ok: false,
      reason: "ai_unavailable",
      raw: reply.raw,
      tokens: reply.tokens,
      latencyMs: reply.latencyMs,
    };
  }
  return { ok: true, analysis, raw: reply.raw, tokens: reply.tokens, latencyMs: reply.latencyMs };
}
