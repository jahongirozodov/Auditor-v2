"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canActAt, auditProjectCurrentOf, nextStage } from "@/lib/approval";
import { emitKpiEvent } from "@/lib/kpi-engine";
import { emitNotification } from "@/lib/notifications/emit";
import type { ApprovalStageKey, AuditProjectStatus, AuditStatus } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";
import type { ActionResult } from "./types";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));
const isStage = (c: unknown): c is ApprovalStageKey =>
  c === "group_lead" || c === "head" || c === "dept";

function canLeadProject(userId: string, role: RoleCode, leaderId: string): boolean {
  return userId === leaderId || role === "super" || role === "head";
}

const CreateProjectInput = z.object({ auditId: z.string().min(1) });

export async function createAuditProject(
  input: z.input<typeof CreateProjectInput>,
): Promise<ActionResult> {
  const parsed = CreateProjectInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { auditId } = parsed.data;

  const { userId, role } = await requireSession();
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    select: {
      status: true,
      leaderId: true,
      goal: true,
      methodology: true,
      scope: true,
      tools: true,
    },
  });
  if (!audit) return { ok: false, error: "not_found" };
  if (!canLeadProject(userId, role, audit.leaderId)) return { ok: false, error: "forbidden" };
  if (audit.status !== "group_forming") return { ok: false, error: "illegal_status" };

  try {
    await prisma.$transaction([
      prisma.auditProject.create({
        data: {
          auditId,
          status: "draft",
          currentApprovalStage: null,
          goal: audit.goal,
          methodology: audit.methodology,
          scope: audit.scope,
          tools: audit.tools,
        },
      }),
      prisma.audit.update({
        where: { id: auditId },
        data: { status: "project_draft", stage: 3 },
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: "project.create",
          entity: auditId,
          level: "info",
        },
      }),
    ]);
  } catch {
    return { ok: false, error: "duplicate" };
  }

  revalidatePath(`/audits/${auditId}`);
  revalidatePath("/audits");
  revalidatePath("/dashboard");
  return { ok: true };
}

const ProjectApprovalInput = z.object({
  auditId: z.string().min(1),
  action: z.enum(["submit", "resubmit", "approve", "return"]),
  comment: z.string().optional(),
});

export async function projectApproval(
  input: z.input<typeof ProjectApprovalInput>,
): Promise<ActionResult> {
  const parsed = ProjectApprovalInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { auditId, action, comment } = parsed.data;

  const { userId, role } = await requireSession();
  const project = await prisma.auditProject.findUnique({
    where: { auditId },
    include: { audit: { select: { status: true, leaderId: true, title: true } } },
  });
  if (!project) return { ok: false, error: "not_found" };

  const cur = auditProjectCurrentOf(project.status, project.currentApprovalStage);

  let nextProjectStatus: AuditProjectStatus;
  let nextAuditStatus: AuditStatus;
  let nextAuditStage: number | undefined;
  let nextProjectStage: string | null;
  let evAction: "Submit" | "Approve" | "Return";
  let evStage: ApprovalStageKey;
  let evState: "done" | "returned";
  let logAction: string;

  if (action === "submit" || action === "resubmit") {
    const want = action === "submit" ? "new" : "returned";
    if (cur !== want) return { ok: false, error: "illegal_transition" };
    if (!canLeadProject(userId, role, project.audit.leaderId)) {
      return { ok: false, error: "forbidden" };
    }
    nextProjectStatus = "submitted";
    nextProjectStage = "head";
    nextAuditStatus = "project_pending";
    nextAuditStage = 4;
    evAction = "Submit";
    evStage = "group_lead";
    evState = "done";
    logAction = "project.submit";
  } else if (action === "approve") {
    if (!isStage(cur) || cur === "group_lead") return { ok: false, error: "illegal_transition" };
    if (!canActAt(role, cur)) return { ok: false, error: "forbidden" };
    const nxt = nextStage(cur);
    nextProjectStatus = nxt ? "submitted" : "approved";
    nextProjectStage = nxt;
    nextAuditStatus = nxt ? "head_approved" : "approved";
    nextAuditStage = nxt ? 4 : 5;
    evAction = "Approve";
    evStage = cur;
    evState = "done";
    logAction = `project.approve.${cur}`;
  } else {
    if (!isStage(cur) || cur === "group_lead") return { ok: false, error: "illegal_transition" };
    if (!canActAt(role, cur)) return { ok: false, error: "forbidden" };
    if (!comment?.trim()) return { ok: false, error: "comment_required" };
    nextProjectStatus = "returned";
    nextProjectStage = null;
    nextAuditStatus = "returned";
    nextAuditStage = undefined;
    evAction = "Return";
    evStage = cur;
    evState = "returned";
    logAction = "project.return";
  }

  await prisma.$transaction(async (tx) => {
    await tx.auditProject.update({
      where: { id: project.id },
      data: { status: nextProjectStatus, currentApprovalStage: nextProjectStage },
    });
    await tx.audit.update({
      where: { id: auditId },
      data: { status: nextAuditStatus, ...(nextAuditStage ? { stage: nextAuditStage } : {}) },
    });
    await tx.auditProjectApproval.create({
      data: {
        projectId: project.id,
        actorId: userId,
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
        entity: auditId,
        level: evState === "returned" ? "warn" : "info",
        payload: J({
          projectId: project.id,
          from: project.status,
          to: nextProjectStatus,
          stage: evStage,
          comment: comment ?? null,
        }),
      },
    });

    if (action === "submit") {
      const alreadyCredited = await tx.kpiEvent.findFirst({
        where: {
          userId: project.audit.leaderId,
          auditId,
          ruleCode: "develop_project",
        },
        select: { id: true },
      });
      if (!alreadyCredited) {
        await emitKpiEvent(tx, {
          userId: project.audit.leaderId,
          ruleCode: "develop_project",
          points: 15,
          auditId,
          payload: { projectId: project.id },
        });
      }
    }
    if (action === "return") {
      await emitNotification(tx, {
        type: "project_returned",
        recipients: [project.audit.leaderId].filter(Boolean) as string[],
        actorId: userId,
        params: { audit: project.audit.title },
        href: `/audits/${project.auditId}`,
        auditId: project.auditId,
        entityType: "audit",
        entityId: project.auditId,
      });
    } else if (nextAuditStatus === "approved") {
      await emitNotification(tx, {
        type: "project_approved",
        recipients: [project.audit.leaderId].filter(Boolean) as string[],
        actorId: userId,
        params: { audit: project.audit.title },
        href: `/audits/${project.auditId}`,
        auditId: project.auditId,
        entityType: "audit",
        entityId: project.auditId,
      });
    }
  });

  revalidatePath(`/audits/${auditId}`);
  revalidatePath("/audits");
  revalidatePath("/dashboard");
  revalidatePath("/kpi");
  return { ok: true };
}

const EDITABLE_PROJECT: AuditProjectStatus[] = ["draft", "returned"];

const EditProjectInput = z.object({
  auditId: z.string().min(1),
  goal: z.string().max(2000).default(""),
  methodology: z.string().max(2000).default(""),
  scope: z.array(z.string().trim().min(1)).default([]),
  tools: z.array(z.string().trim().min(1)).default([]),
});

export async function editProject(input: z.input<typeof EditProjectInput>): Promise<ActionResult> {
  const parsed = EditProjectInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { auditId, goal, methodology, scope, tools } = parsed.data;

  const { userId, role } = await requireSession();
  const project = await prisma.auditProject.findUnique({
    where: { auditId },
    include: { audit: { select: { leaderId: true } } },
  });
  if (!project) return { ok: false, error: "not_found" };
  if (!canLeadProject(userId, role, project.audit.leaderId))
    return { ok: false, error: "forbidden" };
  if (!EDITABLE_PROJECT.includes(project.status)) return { ok: false, error: "illegal_status" };

  await prisma.$transaction([
    prisma.auditProject.update({
      where: { id: project.id },
      data: { goal: goal || null, methodology: methodology || null, scope, tools },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: "project.edit",
        entity: auditId,
        level: "info",
        payload: J({ projectId: project.id, scope: scope.length, tools: tools.length }),
      },
    }),
  ]);

  revalidatePath(`/audits/${auditId}`);
  revalidatePath("/audits");
  return { ok: true };
}
