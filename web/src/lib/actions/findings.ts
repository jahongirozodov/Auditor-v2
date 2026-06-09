"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canActAt, currentOf, nextStage } from "@/lib/approval";
import { nextFindingCode } from "@/lib/finding-code";
import { canDoRemediation } from "@/lib/findings-machine";
import { emitKpiEvent, SEVERITY_BONUS, BONUS_PTS } from "@/lib/kpi-engine";
import type { ApprovalStageKey, FindingStatus, Severity } from "@/lib/types/entities";
import type { ActionResult, CreateResult } from "./types";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));

/** The fields needed to write one Finding row (status starts at "new"). */
export interface FindingRowInput {
  auditId: string;
  taskId: string;
  title: string;
  severity: Severity;
  cvss: number;
  cwe: string;
  asset: string;
  type: string;
  description: string;
  /** Whether AI enriched the recommendation (config drafts may set this true). */
  ai?: boolean;
}

// Create one finding row + its append-only audit-log entry inside a transaction.
// Shared by createFinding (single) and materializeFindings (batch, e.g. config analysis).
async function createFindingTx(
  tx: Prisma.TransactionClient,
  userId: string,
  d: FindingRowInput,
  id: string,
  date: string,
  source = "manual",
) {
  await tx.finding.create({
    data: {
      id,
      auditId: d.auditId,
      taskId: d.taskId,
      title: d.title,
      severity: d.severity,
      cvss: d.cvss,
      status: "new",
      reportedById: userId,
      date,
      asset: d.asset,
      type: d.type,
      cwe: d.cwe,
      description: d.description,
      evidence: 0,
      ai: d.ai ?? false,
      approvalStage: null,
    },
  });
  await tx.auditLog.create({
    data: {
      userId,
      action: "finding.create",
      entity: id,
      level: "info",
      payload: J({ auditId: d.auditId, taskId: d.taskId, severity: d.severity, source }),
    },
  });
}

/**
 * Batch-create draft findings in ONE transaction: pre-allocate sequential codes,
 * write every row + its audit log, then recount each affected audit once. Reuses
 * the same create path as createFinding. Returns the new finding ids in order.
 * Callers must have already authorized + validated the inputs (audit/task exist).
 */
export async function materializeFindings(
  userId: string,
  inputs: FindingRowInput[],
  source = "config",
): Promise<string[]> {
  if (inputs.length === 0) return [];
  const date = new Date().toISOString().slice(0, 10);
  const year = date.slice(0, 4);
  const existing = await prisma.finding.findMany({
    where: { id: { startsWith: `F-${year}-` } },
    select: { id: true },
  });
  const used = existing.map((f) => f.id);
  const ids: string[] = [];
  const affected = new Set<string>();
  const planned = inputs.map((inp) => {
    const id = nextFindingCode(year, [...used, ...ids]);
    ids.push(id);
    affected.add(inp.auditId);
    return { id, inp };
  });
  await prisma.$transaction(async (tx) => {
    for (const { id, inp } of planned) await createFindingTx(tx, userId, inp, id, date, source);
    for (const auditId of affected) await recountFindingsAgg(tx, auditId);
  });
  return ids;
}

// Recompute the denormalized Audit.findings severity counts from the audit's finding rows,
// in-transaction. (`info` severity has no bucket, matching the 4-level severity cards.)
async function recountFindingsAgg(tx: Prisma.TransactionClient, auditId: string) {
  const rows = await tx.finding.findMany({ where: { auditId }, select: { severity: true } });
  const agg = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const r of rows) {
    if (r.severity === "critical") agg.critical++;
    else if (r.severity === "high") agg.high++;
    else if (r.severity === "medium") agg.medium++;
    else if (r.severity === "low") agg.low++;
  }
  await tx.audit.update({ where: { id: auditId }, data: { findings: J(agg) } });
}

const isStage = (c: unknown): c is ApprovalStageKey =>
  c === "group_lead" || c === "head" || c === "dept";

const FindingApprovalInput = z.object({
  findingId: z.string().min(1),
  action: z.enum(["submit", "resubmit", "approve", "return"]),
  comment: z.string().optional(),
});

export async function findingApproval(
  input: z.input<typeof FindingApprovalInput>,
): Promise<ActionResult> {
  const parsed = FindingApprovalInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { findingId, action, comment } = parsed.data;

  const { userId, role } = await requireSession();
  const finding = await prisma.finding.findUnique({ where: { id: findingId } });
  if (!finding) return { ok: false, error: "not_found" };

  const isReporter = finding.reportedById === userId;
  const cur = currentOf(finding.status as FindingStatus, finding.approvalStage);

  // Resolve the transition (status + stage + the appended event) per action.
  let nextStatus: FindingStatus;
  let nextApprovalStage: string | null;
  let evAction: "Submit" | "Approve" | "Return";
  let evStage: ApprovalStageKey;
  let evState: "done" | "returned";
  let logAction: string;

  if (action === "submit" || action === "resubmit") {
    const want = action === "submit" ? "new" : "returned";
    if (cur !== want) return { ok: false, error: "illegal_transition" };
    if (!(isReporter || canActAt(role, "group_lead"))) return { ok: false, error: "forbidden" };
    nextStatus = "review";
    nextApprovalStage = "group_lead";
    evAction = "Submit";
    evStage = "group_lead";
    evState = "done";
    logAction = "finding.submit_review";
  } else if (action === "approve") {
    if (!isStage(cur)) return { ok: false, error: "illegal_transition" };
    if (!canActAt(role, cur)) return { ok: false, error: "forbidden" };
    const nxt = nextStage(cur);
    nextStatus = nxt ? "review" : "approved";
    nextApprovalStage = nxt;
    evAction = "Approve";
    evStage = cur;
    evState = "done";
    logAction = `finding.approve.${cur}`;
  } else {
    // return
    if (!isStage(cur)) return { ok: false, error: "illegal_transition" };
    if (!canActAt(role, cur)) return { ok: false, error: "forbidden" };
    if (!comment?.trim()) return { ok: false, error: "comment_required" };
    nextStatus = "returned";
    nextApprovalStage = null;
    evAction = "Return";
    evStage = cur;
    evState = "returned";
    logAction = "finding.return";
  }

  await prisma.$transaction(async (tx) => {
    await tx.finding.update({
      where: { id: findingId },
      data: { status: nextStatus, approvalStage: nextApprovalStage },
    });
    await tx.approvalEvent.create({
      data: {
        entityType: "finding",
        entityId: findingId,
        who: userId,
        action: evAction,
        stage: evStage,
        state: evState,
        comment: comment?.trim() ? comment.trim() : null,
      },
    });
    await tx.auditLog.create({
      data: {
        userId,
        action: logAction,
        entity: findingId,
        level: evState === "returned" ? "warn" : "info",
        payload: J({
          from: finding.status,
          to: nextStatus,
          stage: evStage,
          comment: comment ?? null,
        }),
      },
    });
    if (nextStatus === "approved") {
      await emitKpiEvent(tx, {
        userId: finding.reportedById,
        ruleCode: "vuln_approved",
        points: 3,
        auditId: finding.auditId,
        countField: "findings",
      });
      const bonusCode = SEVERITY_BONUS[finding.severity as string];
      if (bonusCode) {
        await emitKpiEvent(tx, {
          userId: finding.reportedById,
          ruleCode: bonusCode,
          points: BONUS_PTS[bonusCode],
          auditId: finding.auditId,
        });
      }
    }
  });

  revalidatePath("/findings");
  revalidatePath("/dashboard");
  revalidatePath("/kpi");
  revalidatePath(`/audits/${finding.auditId}`);
  return { ok: true };
}

const CreateFindingInput = z.object({
  auditId: z.string().min(1),
  taskId: z.string().min(1),
  title: z.string().min(3),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  cvss: z.number().min(0).max(10),
  cwe: z.string().default("CWE-284"),
  asset: z.string().default(""),
  type: z.string().min(1),
  description: z.string().default(""),
});

export async function createFinding(
  input: z.input<typeof CreateFindingInput>,
): Promise<CreateResult> {
  const parsed = CreateFindingInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { auditId, taskId, title, severity, cvss, cwe, asset, type, description } = parsed.data;

  // Any authenticated user may file a finding; the reporter is the session user.
  const { userId } = await requireSession();

  const audit = await prisma.audit.findUnique({ where: { id: auditId }, select: { id: true } });
  if (!audit) return { ok: false, error: "not_found" };
  const task = await prisma.task.findUnique({ where: { id: taskId }, select: { auditId: true } });
  if (!task) return { ok: false, error: "not_found" };
  if (task.auditId !== auditId) return { ok: false, error: "task_mismatch" };

  const date = new Date().toISOString().slice(0, 10);
  const year = date.slice(0, 4);
  const existing = await prisma.finding.findMany({
    where: { id: { startsWith: `F-${year}-` } },
    select: { id: true },
  });
  const id = nextFindingCode(
    year,
    existing.map((f) => f.id),
  );

  try {
    await prisma.$transaction(async (tx) => {
      await createFindingTx(
        tx,
        userId,
        { auditId, taskId, title, severity, cvss, cwe, asset, type, description, ai: false },
        id,
        date,
        "manual",
      );
      await recountFindingsAgg(tx, auditId);
    });
  } catch {
    return { ok: false, error: "code_conflict" };
  }

  revalidatePath("/findings");
  revalidatePath("/dashboard");
  revalidatePath(`/audits/${auditId}`);
  return { ok: true, id };
}

const FindingRemediationInput = z.object({
  findingId: z.string().min(1),
  action: z.enum(["startFixing", "markFixed", "startRetest", "passRetest", "failRetest"]),
  comment: z.string().optional(),
});

/**
 * Post-approval remediation: approved → fixing → fixed → retest → closed (failRetest → fixing).
 * Assignee (of the finding's task) fixes; group lead retests. Appends a `finding_remediation`
 * ApprovalEvent for the timeline. Mirrors `taskTransition`.
 */
export async function findingRemediation(
  input: z.input<typeof FindingRemediationInput>,
): Promise<ActionResult> {
  const parsed = FindingRemediationInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { findingId, action, comment } = parsed.data;

  const { userId, role } = await requireSession();
  const finding = await prisma.finding.findUnique({
    where: { id: findingId },
    select: { status: true, taskId: true, auditId: true },
  });
  if (!finding) return { ok: false, error: "not_found" };
  const task = await prisma.task.findUnique({
    where: { id: finding.taskId },
    select: { assigneeId: true },
  });
  const isAssignee = task?.assigneeId === userId;

  const guard = canDoRemediation(
    action,
    finding.status as FindingStatus,
    { role, isAssignee },
    comment,
  );
  if (!guard.ok) return { ok: false, error: guard.reason };
  const to = guard.to as FindingStatus;

  await prisma.$transaction([
    prisma.finding.update({ where: { id: findingId }, data: { status: to } }),
    prisma.approvalEvent.create({
      data: {
        entityType: "finding_remediation",
        entityId: findingId,
        who: userId,
        action,
        stage: "remediation",
        state: action === "failRetest" ? "returned" : "done",
        comment: comment?.trim() ? comment.trim() : null,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: `finding.remediation.${action}`,
        entity: findingId,
        level: action === "failRetest" ? "warn" : "info",
        payload: J({ from: finding.status, to, comment: comment ?? null }),
      },
    }),
  ]);

  revalidatePath("/findings");
  revalidatePath("/dashboard");
  revalidatePath(`/audits/${finding.auditId}`);
  return { ok: true };
}
