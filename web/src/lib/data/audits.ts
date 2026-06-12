import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { Audit, AuditStatus, SeverityCounts, TaskCounts } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

type Row = {
  id: string;
  code: string;
  title: string;
  orgId: string;
  type: string;
  status: string;
  stage: number;
  startDate: string;
  endDate: string;
  progress: number;
  leaderId: string;
  lastSync: string;
  pinned: boolean;
  goal: string | null;
  methodology: string | null;
  scope: string[];
  tools: string[];
  findings: unknown;
  tasksAgg: unknown;
  members: { userId: string }[];
};

function toAudit(a: Row): Audit {
  return {
    id: a.id,
    code: a.code,
    title: a.title,
    org: a.orgId,
    type: a.type,
    status: a.status as AuditStatus,
    stage: a.stage,
    startDate: a.startDate,
    endDate: a.endDate,
    progress: a.progress,
    leader: a.leaderId,
    members: a.members.map((m) => m.userId),
    findings: a.findings as SeverityCounts,
    tasks: a.tasksAgg as TaskCounts,
    lastSync: a.lastSync,
    pinned: a.pinned,
    goal: a.goal ?? undefined,
    methodology: a.methodology ?? undefined,
    scope: a.scope,
    tools: a.tools,
  };
}

export const getAudits = cache(
  async (): Promise<Audit[]> =>
    // Stable order (recent code first) — deterministic across row updates.
    (await prisma.audit.findMany({ include: { members: true }, orderBy: { code: "desc" } })).map(
      toAudit,
    ),
);

export const getAuditById = cache(async (id: string): Promise<Audit | undefined> => {
  const a = await prisma.audit.findUnique({ where: { id }, include: { members: true } });
  return a ? toAudit(a) : undefined;
});

export const getAuditsByOrg = cache(
  async (orgId: string): Promise<Audit[]> =>
    (await prisma.audit.findMany({ where: { orgId }, include: { members: true } })).map(toAudit),
);

/** Audits visible to a user based on their role. Used for scoped UI data. */
export const getScopedAudits = cache(async (userId: string, role: RoleCode): Promise<Audit[]> => {
  if (role === "super") return getAudits();
  const where =
    role === "head" || role === "chief"
      ? { members: { some: { userId } } }
      : role === "lead"
        ? { leaderId: userId }
        : { members: { some: { userId } } };
  return (
    await prisma.audit.findMany({ where, include: { members: true }, orderBy: { code: "desc" } })
  ).map(toAudit);
});
