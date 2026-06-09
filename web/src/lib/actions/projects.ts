"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canActAt, nextStage, projectCurrentOf } from "@/lib/approval";
import type { ApprovalStageKey, AuditStatus } from "@/lib/types/entities";
import type { ActionResult } from "./types";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));
const isStage = (c: unknown): c is ApprovalStageKey =>
  c === "group_lead" || c === "head" || c === "dept";

const ProjectApprovalInput = z.object({
  auditId: z.string().min(1),
  action: z.enum(["submit", "resubmit", "approve", "return"]),
  comment: z.string().optional(),
});

/**
 * Per-audit project approval. Group lead submits (completes group_lead) → head →
 * dept; final dept approval advances Audit.status to `assigning` (docs/04). Return
 * sets `returned` (mandatory comment). Mirrors the finding flow + couples lifecycle.
 */
export async function projectApproval(
  input: z.input<typeof ProjectApprovalInput>,
): Promise<ActionResult> {
  const parsed = ProjectApprovalInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { auditId, action, comment } = parsed.data;

  const { userId, role } = await requireSession();
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    select: { status: true, projectStage: true },
  });
  if (!audit) return { ok: false, error: "not_found" };

  const cur = projectCurrentOf(audit.status as AuditStatus, audit.projectStage);

  let nextStatus: AuditStatus;
  let nextProjectStage: string | null;
  let evAction: "Submit" | "Approve" | "Return";
  let evStage: ApprovalStageKey;
  let evState: "done" | "returned";
  let logAction: string;

  if (action === "submit" || action === "resubmit") {
    const want = action === "submit" ? "new" : "returned";
    if (cur !== want) return { ok: false, error: "illegal_transition" };
    if (!canActAt(role, "group_lead")) return { ok: false, error: "forbidden" }; // group_lead duty
    nextStatus = "project_pending";
    nextProjectStage = "head"; // group_lead is the submitter → first approver is head
    evAction = "Submit";
    evStage = "group_lead";
    evState = "done";
    logAction = "project.submit";
  } else if (action === "approve") {
    if (!isStage(cur) || cur === "group_lead") return { ok: false, error: "illegal_transition" };
    if (!canActAt(role, cur)) return { ok: false, error: "forbidden" };
    const nxt = nextStage(cur);
    nextProjectStage = nxt;
    nextStatus = nxt ? "project_pending" : "assigning"; // dept approve → audit proceeds
    evAction = "Approve";
    evStage = cur;
    evState = "done";
    logAction = `project.approve.${cur}`;
  } else {
    // return
    if (!isStage(cur) || cur === "group_lead") return { ok: false, error: "illegal_transition" };
    if (!canActAt(role, cur)) return { ok: false, error: "forbidden" };
    if (!comment?.trim()) return { ok: false, error: "comment_required" };
    nextStatus = "returned";
    nextProjectStage = null;
    evAction = "Return";
    evStage = cur;
    evState = "returned";
    logAction = "project.return";
  }

  await prisma.$transaction([
    prisma.audit.update({
      where: { id: auditId },
      data: { status: nextStatus, projectStage: nextProjectStage },
    }),
    prisma.approvalEvent.create({
      data: {
        entityType: "project",
        entityId: auditId,
        who: userId,
        action: evAction,
        stage: evStage,
        state: evState,
        comment: comment?.trim() ? comment.trim() : null,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: logAction,
        entity: auditId,
        level: evState === "returned" ? "warn" : "info",
        payload: J({
          from: audit.status,
          to: nextStatus,
          stage: evStage,
          comment: comment ?? null,
        }),
      },
    }),
  ]);

  revalidatePath(`/audits/${auditId}`);
  revalidatePath("/audits");
  revalidatePath("/dashboard");
  return { ok: true };
}

// The project content is editable only before/around submission (group lead's window).
const EDITABLE_PROJECT = ["project_draft", "returned"];

const EditProjectInput = z.object({
  auditId: z.string().min(1),
  goal: z.string().max(2000).default(""),
  methodology: z.string().max(2000).default(""),
  scope: z.array(z.string().trim().min(1)).default([]),
  tools: z.array(z.string().trim().min(1)).default([]),
});

/** Edit the Project tab content (goal/methodology/scope/tools). Group lead, while drafting. */
export async function editProject(input: z.input<typeof EditProjectInput>): Promise<ActionResult> {
  const parsed = EditProjectInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { auditId, goal, methodology, scope, tools } = parsed.data;

  const { userId, role } = await requireSession();
  if (!canActAt(role, "group_lead")) return { ok: false, error: "forbidden" }; // group_lead duty
  const audit = await prisma.audit.findUnique({ where: { id: auditId }, select: { status: true } });
  if (!audit) return { ok: false, error: "not_found" };
  if (!EDITABLE_PROJECT.includes(audit.status)) return { ok: false, error: "illegal_status" };

  await prisma.$transaction([
    prisma.audit.update({
      where: { id: auditId },
      data: { goal: goal || null, methodology: methodology || null, scope, tools },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: "project.edit",
        entity: auditId,
        level: "info",
        payload: J({ scope: scope.length, tools: tools.length }),
      },
    }),
  ]);

  revalidatePath(`/audits/${auditId}`);
  revalidatePath("/audits");
  return { ok: true };
}
