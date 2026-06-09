import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { AuditToken, TokenStatus } from "@/lib/types/entities";

export const getTokensByAudit = cache(async (auditId: string): Promise<AuditToken[]> => {
  const rows = await prisma.auditToken.findMany({ where: { auditId } });
  return rows.map((t) => ({
    id: t.id,
    audit: t.auditId,
    user: t.userId,
    device: t.device,
    hostname: t.hostname,
    os: t.os,
    agent: t.agent,
    ip: t.ip,
    issued: t.issued,
    expires: t.expires,
    status: t.status as TokenStatus,
    lastUsed: t.lastUsed,
    tasks: t.tasks,
  }));
});
