import "server-only";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac.server";
import type { RoleCode } from "@/lib/types/roles";

/** True if the user is the audit leader or a group member. */
export async function isAuditMember(auditId: string, userId: string): Promise<boolean> {
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    select: { leaderId: true, members: { where: { userId }, select: { userId: true } } },
  });
  if (!audit) return false;
  return audit.leaderId === userId || audit.members.length > 0;
}

/**
 * Who may add/manage audit evidence: a group member, the audit leader, or a
 * system admin with audit.update. Server-side authorization for evidence actions.
 */
export async function canManageEvidence(auditId: string, userId: string): Promise<boolean> {
  if (await requirePermission(userId, "audit.update")) return true;
  return isAuditMember(auditId, userId);
}

/**
 * True if the user can manage this audit's team and tokens:
 * super/head roles always qualify; otherwise must be the audit's leaderId.
 */
export async function isAuditLeader(
  auditId: string,
  userId: string,
  role: RoleCode,
): Promise<boolean> {
  if (role === "super" || role === "head") return true;
  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    select: { leaderId: true },
  });
  if (!audit) return false;
  return audit.leaderId === userId;
}
