import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { AuditToken, TokenStatus } from "@/lib/types/entities";

type Row = {
  id: string;
  auditId: string;
  userId: string;
  device: string;
  hostname: string;
  os: string;
  agent: string;
  ip: string;
  issued: string;
  expires: string;
  status: string;
  lastUsed: string;
  tasks: number;
};

function toToken(t: Row): AuditToken {
  return {
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
  };
}

/** All audit tokens, newest issued first — the admin tokens screen. */
export const getAllTokens = cache(
  async (): Promise<AuditToken[]> =>
    (await prisma.auditToken.findMany({ orderBy: { issued: "desc" } })).map(toToken),
);

export const getTokensByAudit = cache(
  async (auditId: string): Promise<AuditToken[]> =>
    (await prisma.auditToken.findMany({ where: { auditId } })).map(toToken),
);
