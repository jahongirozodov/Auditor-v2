"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { canActAt, nextStage, reportCurrentOf } from "@/lib/approval";
import { isAuditMember, isAuditLeader } from "@/lib/audit-access";
import { generate, getOllamaConfig, isAiEnabled } from "@/lib/ai/ollama";
import { SYSTEM } from "@/lib/ai/prompts";
import { emitNotification } from "@/lib/notifications/emit";
import type { ApprovalStageKey, ReportStatus } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";
import type { GenerateReportInput } from "@/lib/reports/constants";
import type { ActionResult } from "./types";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));
const now = () => new Date().toISOString().slice(0, 16).replace("T", " ");

export async function generateReport(input: GenerateReportInput) {
  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "report.create"))) throw new Error("Ruxsat yoʻq");
  if (!(await isAuditMember(input.auditId, userId))) throw new Error("Ruxsat yoʻq");
  if (!input.title.trim() || !input.auditId || !input.formats.length)
    return { ok: false, error: "Maydonlar toʻldirilishi shart" };

  const id = `R-${Date.now()}`;
  await prisma.report.create({
    data: {
      id,
      title: input.title,
      auditId: input.auditId,
      type: input.type,
      status: "draft",
      generated: "—",
      size: "—",
      format: input.formats,
      authorId: userId,
    },
  });
  revalidatePath("/reports");
  return { ok: true, id };
}

export async function deleteReport(id: string) {
  const { userId, role } = await requireSession();
  if (!(await requirePermission(userId, "report.create"))) throw new Error("Ruxsat yoʻq");
  const report = await prisma.report.findUnique({
    where: { id },
    select: { id: true, authorId: true, auditId: true },
  });
  if (!report) throw new Error("Topilmadi");
  if (
    report.authorId !== userId &&
    !(await isAuditLeader(report.auditId, userId, role))
  )
    throw new Error("Ruxsat yoʻq");
  await prisma.report.delete({ where: { id } });
  revalidatePath("/reports");
  return { ok: true };
}

const isStage = (c: unknown): c is ApprovalStageKey =>
  c === "group_lead" || c === "head" || c === "dept";

const ReportApprovalInput = z.object({
  reportId: z.string().min(1),
  action: z.enum(["submit", "approve", "return"]),
  comment: z.string().optional(),
});

/**
 * 3-stage approval for a report, mirroring `findingApproval`. The author submits a
 * draft (or resubmits a returned one) → group_lead → head → dept approve, or any
 * approver returns it to the author for edits. Each transition appends an
 * append-only ApprovalEvent + AuditLog row in one transaction.
 */
export async function reportApproval(
  input: z.input<typeof ReportApprovalInput>,
): Promise<ActionResult> {
  const parsed = ReportApprovalInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { reportId, action, comment } = parsed.data;

  const { userId, role } = await requireSession();
  if (
    action === "submit"
      ? !(await requirePermission(userId, "report.create"))
      : !(await requirePermission(userId, "report.approve"))
  )
    return { ok: false, error: "forbidden" };

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return { ok: false, error: "not_found" };

  const isAuthor = report.authorId === userId;
  const cur = reportCurrentOf(report.status as ReportStatus, report.approvalStage);

  let nextStatus: ReportStatus;
  let nextApprovalStage: string | null;
  let evAction: "Submit" | "Approve" | "Return";
  let evStage: ApprovalStageKey;
  let evState: "done" | "returned";
  let logAction: string;

  if (action === "submit") {
    if (cur !== "new" && cur !== "returned") return { ok: false, error: "illegal_transition" };
    if (!(isAuthor || canActAt(role as RoleCode, "group_lead")))
      return { ok: false, error: "forbidden" };
    nextStatus = "review";
    nextApprovalStage = "group_lead";
    evAction = "Submit";
    evStage = "group_lead";
    evState = "done";
    logAction = "report.submit_review";
  } else if (action === "approve") {
    if (!isStage(cur)) return { ok: false, error: "illegal_transition" };
    if (!canActAt(role as RoleCode, cur)) return { ok: false, error: "forbidden" };
    const nxt = nextStage(cur);
    nextStatus = nxt ? "review" : "approved";
    nextApprovalStage = nxt;
    evAction = "Approve";
    evStage = cur;
    evState = "done";
    logAction = `report.approve.${cur}`;
  } else {
    // return
    if (!isStage(cur)) return { ok: false, error: "illegal_transition" };
    if (!canActAt(role as RoleCode, cur)) return { ok: false, error: "forbidden" };
    if (!comment?.trim()) return { ok: false, error: "comment_required" };
    nextStatus = "returned";
    nextApprovalStage = null;
    evAction = "Return";
    evStage = cur;
    evState = "returned";
    logAction = "report.return";
  }

  await prisma.$transaction(async (tx) => {
    await tx.report.update({
      where: { id: reportId },
      data: { status: nextStatus, approvalStage: nextApprovalStage },
    });
    await tx.approvalEvent.create({
      data: {
        entityType: "report",
        entityId: reportId,
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
        entity: reportId,
        level: evState === "returned" ? "warn" : "info",
        payload: J({
          from: report.status,
          to: nextStatus,
          stage: evStage,
          comment: comment ?? null,
        }),
      },
    });
    if (action === "return") {
      await emitNotification(tx, {
        type: "report_returned",
        recipients: [report.authorId].filter(Boolean) as string[],
        actorId: userId,
        params: { title: report.title },
        href: `/reports/${report.id}`,
        entityType: "report",
        entityId: report.id,
      });
    } else if (action === "approve" && nextStatus === "approved") {
      await emitNotification(tx, {
        type: "report_approved",
        recipients: [report.authorId].filter(Boolean) as string[],
        actorId: userId,
        params: { title: report.title },
        href: `/reports/${report.id}`,
        entityType: "report",
        entityId: report.id,
      });
    }
  });

  revalidatePath("/reports");
  return { ok: true };
}

/**
 * Regenerate a report's executive summary via local Ollama and persist it to
 * `Report.summary` (rendered in the print view). Degrades gracefully when AI is
 * disabled or unreachable. Every call is logged to AiAnalysisResult (docs/05).
 */
export async function regenerateReportSummary(reportId: string): Promise<ActionResult> {
  const { userId } = await requireSession();
  if (!(await requirePermission(userId, ["report.create", "ai.use"])))
    return { ok: false, error: "forbidden" };

  const report = await prisma.report.findUnique({ where: { id: reportId } });
  if (!report) return { ok: false, error: "not_found" };
  if (!(await isAuditMember(report.auditId, userId))) return { ok: false, error: "forbidden" };
  if (!isAiEnabled()) return { ok: false, error: "degraded" };

  const audit = await prisma.audit.findUnique({
    where: { id: report.auditId },
    select: { code: true, title: true },
  });
  const findings = await prisma.finding.findMany({
    where: { auditId: report.auditId },
    select: { title: true, severity: true },
    orderBy: { severity: "asc" },
    take: 50,
  });

  const findingLines = findings.length
    ? findings.map((f) => `- [${f.severity}] ${f.title}`).join("\n")
    : "- (findinglar yoʻq)";
  const prompt = [
    `Hisobot turi: ${report.type}.`,
    `Audit: ${audit?.code ?? report.auditId} — ${audit?.title ?? ""}.`,
    `Findinglar (${findings.length}):`,
    findingLines,
    "",
    "Yuqoridagi audit uchun rahbariyat uchun qisqa executive summary yoz (3-5 gap, oʻzbek tilida): umumiy holat, asosiy xavflar va tavsiya.",
  ].join("\n");

  const { model } = getOllamaConfig();
  const reply = await generate(`${SYSTEM.chat}\n\n${prompt}`);

  await prisma.aiAnalysisResult.create({
    data: {
      uploadId: null,
      scope: "chat",
      model,
      input: prompt.slice(0, 20_000),
      output: reply.text,
      latencyMs: reply.latencyMs,
      tokens: reply.tokens,
      ok: reply.ok,
      createdById: userId,
    },
  });

  if (!reply.ok || !reply.text.trim()) return { ok: false, error: "degraded" };

  const kb = Math.max(1, Math.round(reply.text.length / 1024));
  await prisma.report.update({
    where: { id: reportId },
    data: { summary: reply.text, generated: now(), size: `${kb} KB` },
  });
  await emitNotification(prisma, {
    type: "report_ready",
    recipients: [report.authorId].filter(Boolean) as string[],
    actorId: userId,
    params: { title: report.title },
    href: `/reports/${report.id}`,
    entityType: "report",
    entityId: report.id,
  });
  revalidatePath("/reports");
  return { ok: true };
}
