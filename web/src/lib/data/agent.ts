import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";

export interface AgentOverview {
  activeTokens: number;
  connectedDevices: number;
  /** Completed/failed sync sessions in the last 24h. */
  sync24h: number;
  /** Denied/expired/revoked token uses in the last 24h. */
  anomalies: number;
  /** ISO of the most recent completed sync, or null. */
  latestSync: string | null;
}

export interface SyncSessionView {
  id: string;
  tokenId: string;
  auditId: string;
  userId: string;
  status: string;
  findingCount: number;
  startedAt: string;
  completedAt: string | null;
}

export interface TokenUsageView {
  id: string;
  tokenId: string;
  action: string;
  status: string;
  ip: string | null;
  createdAt: string;
}

export interface AgentVersionView {
  version: string;
  notes: string | null;
  createdAt: string;
}

export interface SyncedFindingView {
  id: string;
  title: string;
  severity: string;
  status: string;
  date: string;
  evidence: number;
  reportedById: string;
  auditId: string;
}

const dayAgo = () => new Date(Date.now() - 24 * 60 * 60 * 1000);
const ANOMALY_STATUSES = ["expired", "revoked", "denied", "not_found"];

/** Headline counters for the /agent dashboard. */
export const getAgentOverview = cache(async (): Promise<AgentOverview> => {
  const since = dayAgo();
  const [activeTokens, activeRows, sync24h, anomalies, latest] = await Promise.all([
    prisma.auditToken.count({ where: { status: "active" } }),
    prisma.auditToken.findMany({ where: { status: "active" }, select: { hostname: true } }),
    prisma.agentSyncSession.count({ where: { startedAt: { gte: since } } }),
    prisma.auditTokenUsageLog.count({
      where: { createdAt: { gte: since }, status: { in: ANOMALY_STATUSES } },
    }),
    prisma.agentSyncSession.findFirst({
      where: { status: "completed", completedAt: { not: null } },
      orderBy: { completedAt: "desc" },
      select: { completedAt: true },
    }),
  ]);

  const connectedDevices = new Set(activeRows.map((r) => r.hostname).filter((h) => h && h !== "—"))
    .size;

  return {
    activeTokens,
    connectedDevices,
    sync24h,
    anomalies,
    latestSync: latest?.completedAt?.toISOString() ?? null,
  };
});

/** Recent sync sessions, newest first. */
export const getSyncSessions = cache(async (limit = 20): Promise<SyncSessionView[]> => {
  const rows = await prisma.agentSyncSession.findMany({
    orderBy: { startedAt: "desc" },
    take: limit,
  });
  return rows.map((s) => ({
    id: s.id,
    tokenId: s.tokenId,
    auditId: s.auditId,
    userId: s.userId,
    status: s.status,
    findingCount: s.findingCount,
    startedAt: s.startedAt.toISOString(),
    completedAt: s.completedAt?.toISOString() ?? null,
  }));
});

/** Recent token-usage log entries, newest first. */
export const getTokenUsage = cache(async (limit = 20): Promise<TokenUsageView[]> => {
  const rows = await prisma.auditTokenUsageLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return rows.map((u) => ({
    id: u.id,
    tokenId: u.tokenId,
    action: u.action,
    status: u.status,
    ip: u.ip,
    createdAt: u.createdAt.toISOString(),
  }));
});

/** Latest published desktop-agent build. */
export const getAgentVersion = cache(async (): Promise<AgentVersionView | null> => {
  const v = await prisma.desktopAgentVersion.findFirst({ orderBy: { createdAt: "desc" } });
  return v ? { version: v.version, notes: v.notes, createdAt: v.createdAt.toISOString() } : null;
});

/**
 * Findings that arrived from a desktop agent's offline sync — identified by a non-null
 * `idempotencyKey` (set only by the agent findings/sync path). Newest first.
 */
export const getSyncedFindings = cache(async (limit = 30): Promise<SyncedFindingView[]> => {
  const rows = await prisma.finding.findMany({
    where: { idempotencyKey: { not: null } },
    orderBy: { date: "desc" },
    take: limit,
    select: {
      id: true,
      title: true,
      severity: true,
      status: true,
      date: true,
      evidence: true,
      reportedById: true,
      auditId: true,
    },
  });
  return rows;
});
