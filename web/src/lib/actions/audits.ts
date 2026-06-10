"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { nextAuditCode } from "@/lib/audit-code";
import { emitKpiEvent } from "@/lib/kpi-engine";
import type { ActionResult, CreateResult } from "./types";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));
// Statuses where the team is still editable (before fieldwork).
const EDITABLE = ["planning", "group_forming", "project_draft"];

const CreateAuditInput = z.object({
  title: z.string().min(3),
  type: z.string().min(1),
  orgId: z.string().min(1),
  startDate: z.string().min(4),
  endDate: z.string().min(4),
  leaderId: z.string().min(1),
  memberIds: z.array(z.string()).default([]),
});

export async function createAudit(input: z.input<typeof CreateAuditInput>): Promise<CreateResult> {
  const parsed = CreateAuditInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { title, type, orgId, startDate, endDate, leaderId, memberIds } = parsed.data;
  if (startDate > endDate) return { ok: false, error: "bad_dates" };

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "audit.create"))) return { ok: false, error: "forbidden" };

  const year = startDate.slice(0, 4);
  const existing = await prisma.audit.findMany({
    where: { code: { startsWith: `AUD-${year}-` } },
    select: { code: true },
  });
  const code = nextAuditCode(
    year,
    existing.map((e) => e.code),
  );
  const members = Array.from(new Set([leaderId, ...memberIds]));

  try {
    await prisma.$transaction(async (tx) => {
      await tx.audit.create({
        data: {
          id: code,
          code,
          title,
          orgId,
          type,
          status: "group_forming",
          stage: 2,
          startDate,
          endDate,
          progress: 0,
          leaderId,
          lastSync: "—",
          pinned: false,
          projectStage: null,
          findings: J({ critical: 0, high: 0, medium: 0, low: 0 }),
          tasksAgg: J({ total: 0, done: 0, in_progress: 0, blocked: 0, new: 0 }),
        },
      });
      await tx.auditMember.createMany({
        data: members.map((uid) => ({ auditId: code, userId: uid })),
        skipDuplicates: true,
      });
      await tx.auditLog.create({
        data: {
          userId,
          action: "audit.create",
          entity: code,
          level: "info",
          payload: J({ title, orgId, leaderId, members }),
        },
      });
      // Leader gets act_as_group_lead + audit_participation; countField:audits only once.
      await emitKpiEvent(tx, {
        userId: leaderId,
        ruleCode: "act_as_group_lead",
        points: 15,
        auditId: code,
      });
      await emitKpiEvent(tx, {
        userId: leaderId,
        ruleCode: "audit_participation",
        points: 5,
        auditId: code,
        countField: "audits",
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return { ok: false, error: "code_conflict" };
    }
    console.error("createAudit failed", error);
    return { ok: false, error: "failed" };
  }

  revalidatePath("/audits");
  revalidatePath("/dashboard");
  revalidatePath("/kpi");
  return { ok: true, id: code };
}

const TeamInput = z.object({ auditId: z.string().min(1), userId: z.string().min(1) });

async function loadAudit(auditId: string) {
  return prisma.audit.findUnique({
    where: { id: auditId },
    select: { status: true, leaderId: true },
  });
}

export async function addMember(input: z.input<typeof TeamInput>): Promise<ActionResult> {
  const parsed = TeamInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { auditId, userId } = parsed.data;

  const { userId: actorId } = await requireSession();
  if (!(await requirePermission(actorId, "group.edit"))) return { ok: false, error: "forbidden" };
  const a = await loadAudit(auditId);
  if (!a) return { ok: false, error: "not_found" };
  if (!EDITABLE.includes(a.status)) return { ok: false, error: "illegal_status" };

  await prisma.$transaction(async (tx) => {
    await tx.auditMember.upsert({
      where: { auditId_userId: { auditId, userId } },
      create: { auditId, userId },
      update: {},
    });
    await tx.auditLog.create({
      data: {
        userId: actorId,
        action: "audit.team.add",
        entity: auditId,
        level: "info",
        payload: J({ userId }),
      },
    });
    await emitKpiEvent(tx, {
      userId,
      ruleCode: "audit_participation",
      points: 5,
      auditId,
      countField: "audits",
    });
  });
  revalidatePath(`/audits/${auditId}`);
  revalidatePath("/audits");
  revalidatePath("/kpi");
  return { ok: true };
}

export async function removeMember(input: z.input<typeof TeamInput>): Promise<ActionResult> {
  const parsed = TeamInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { auditId, userId } = parsed.data;

  const { userId: actorId } = await requireSession();
  if (!(await requirePermission(actorId, "group.edit"))) return { ok: false, error: "forbidden" };
  const a = await loadAudit(auditId);
  if (!a) return { ok: false, error: "not_found" };
  if (!EDITABLE.includes(a.status)) return { ok: false, error: "illegal_status" };
  if (userId === a.leaderId) return { ok: false, error: "cannot_remove_lead" };

  await prisma.$transaction([
    prisma.auditMember.deleteMany({ where: { auditId, userId } }),
    prisma.auditLog.create({
      data: {
        userId: actorId,
        action: "audit.team.remove",
        entity: auditId,
        level: "info",
        payload: J({ userId }),
      },
    }),
  ]);
  revalidatePath(`/audits/${auditId}`);
  revalidatePath("/audits");
  return { ok: true };
}

export async function promoteLead(input: z.input<typeof TeamInput>): Promise<ActionResult> {
  const parsed = TeamInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { auditId, userId } = parsed.data;

  const { userId: actorId } = await requireSession();
  if (!(await requirePermission(actorId, "group.edit"))) return { ok: false, error: "forbidden" };
  const a = await loadAudit(auditId);
  if (!a) return { ok: false, error: "not_found" };
  if (!EDITABLE.includes(a.status)) return { ok: false, error: "illegal_status" };

  await prisma.$transaction([
    prisma.auditMember.upsert({
      where: { auditId_userId: { auditId, userId } },
      create: { auditId, userId },
      update: {},
    }),
    prisma.audit.update({ where: { id: auditId }, data: { leaderId: userId } }),
    prisma.auditLog.create({
      data: {
        userId: actorId,
        action: "audit.team.promote",
        entity: auditId,
        level: "info",
        payload: J({ userId }),
      },
    }),
  ]);
  revalidatePath(`/audits/${auditId}`);
  revalidatePath("/audits");
  return { ok: true };
}
