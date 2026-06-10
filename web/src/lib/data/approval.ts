import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  APPROVAL_STAGES,
  auditProjectCurrentOf,
  currentOf,
  reportCurrentOf,
  type ApprovalCurrent,
} from "@/lib/approval";
import type {
  ApprovalEvent,
  ApprovalStage,
  ApprovalStageKey,
  ApprovalState,
  FindingStatus,
  ReportStatus,
} from "@/lib/types/entities";

export interface FindingApprovalView {
  stages: ApprovalStage[];
  timeline: ApprovalEvent[];
  current: ApprovalCurrent;
}

/** Generic {stages, timeline, current} view shared by finding + project approval. */
export type ApprovalView = FindingApprovalView;

function toTimeline(
  events: {
    who: string;
    action: string;
    stage: string;
    createdAt: Date;
    state: string;
    comment: string | null;
  }[],
): ApprovalEvent[] {
  return events.map((e) => ({
    who: e.who,
    action: e.action,
    stage: e.stage as ApprovalStageKey,
    t: e.createdAt.toISOString().slice(0, 10),
    state: e.state as ApprovalState,
    comment: e.comment ?? undefined,
  }));
}

/** Build the ApprovalFlow props for a finding (stages config + DB timeline + current). */
export const getFindingApproval = cache(
  async (findingId: string): Promise<FindingApprovalView | null> => {
    const f = await prisma.finding.findUnique({
      where: { id: findingId },
      select: { status: true, approvalStage: true },
    });
    if (!f) return null;
    const events = await prisma.approvalEvent.findMany({
      where: { entityType: "finding", entityId: findingId },
      orderBy: { createdAt: "asc" },
    });
    const timeline: ApprovalEvent[] = events.map((e) => ({
      who: e.who,
      action: e.action,
      stage: e.stage as ApprovalStageKey,
      t: e.createdAt.toISOString().slice(0, 10),
      state: e.state as ApprovalState,
      comment: e.comment ?? undefined,
    }));
    return {
      stages: APPROVAL_STAGES,
      timeline,
      current: currentOf(f.status as FindingStatus, f.approvalStage),
    };
  },
);

/** id → approval view for the findings list (drawer reads without a round-trip). */
export const getFindingApprovals = cache(async (): Promise<Record<string, FindingApprovalView>> => {
  const findings = await prisma.finding.findMany({
    select: { id: true, status: true, approvalStage: true },
  });
  const events = await prisma.approvalEvent.findMany({
    where: { entityType: "finding" },
    orderBy: { createdAt: "asc" },
  });
  const byId: Record<string, ApprovalEvent[]> = {};
  for (const e of events) {
    (byId[e.entityId] ??= []).push({
      who: e.who,
      action: e.action,
      stage: e.stage as ApprovalStageKey,
      t: e.createdAt.toISOString().slice(0, 10),
      state: e.state as ApprovalState,
      comment: e.comment ?? undefined,
    });
  }
  return Object.fromEntries(
    findings.map((f) => [
      f.id,
      {
        stages: APPROVAL_STAGES,
        timeline: byId[f.id] ?? [],
        current: currentOf(f.status as FindingStatus, f.approvalStage),
      },
    ]),
  );
});

/** id → approval view for the reports list (cards read without a round-trip). */
export const getReportApprovals = cache(async (): Promise<Record<string, ApprovalView>> => {
  const reports = await prisma.report.findMany({
    select: { id: true, status: true, approvalStage: true },
  });
  const events = await prisma.approvalEvent.findMany({
    where: { entityType: "report" },
    orderBy: { createdAt: "asc" },
  });
  const byId: Record<string, ApprovalEvent[]> = {};
  for (const e of events) {
    (byId[e.entityId] ??= []).push({
      who: e.who,
      action: e.action,
      stage: e.stage as ApprovalStageKey,
      t: e.createdAt.toISOString().slice(0, 10),
      state: e.state as ApprovalState,
      comment: e.comment ?? undefined,
    });
  }
  return Object.fromEntries(
    reports.map((r) => [
      r.id,
      {
        stages: APPROVAL_STAGES,
        timeline: byId[r.id] ?? [],
        current: reportCurrentOf(r.status as ReportStatus, r.approvalStage),
      },
    ]),
  );
});

/** id → remediation timeline (finding_remediation events) for the findings drawer. */
export const getFindingRemediations = cache(async (): Promise<Record<string, ApprovalEvent[]>> => {
  const events = await prisma.approvalEvent.findMany({
    where: { entityType: "finding_remediation" },
    orderBy: { createdAt: "asc" },
  });
  const byId: Record<string, typeof events> = {};
  for (const e of events) (byId[e.entityId] ??= []).push(e);
  return Object.fromEntries(Object.entries(byId).map(([id, evs]) => [id, toTimeline(evs)]));
});

/** Project (per-audit) approval view — group_lead submits, head → dept approve. */
export const getProjectApproval = cache(async (auditId: string): Promise<ApprovalView | null> => {
  const project = await prisma.auditProject.findUnique({
    where: { auditId },
    include: { approvals: { orderBy: { createdAt: "asc" } } },
  });
  if (!project) return null;
  return {
    stages: APPROVAL_STAGES,
    timeline: project.approvals.map((e) => ({
      who: e.actorId,
      action: e.action,
      stage: e.stage as ApprovalStageKey,
      t: e.createdAt.toISOString().slice(0, 10),
      state: e.state as ApprovalState,
      comment: e.comment ?? undefined,
    })),
    current: auditProjectCurrentOf(project.status, project.currentApprovalStage),
  };
});
