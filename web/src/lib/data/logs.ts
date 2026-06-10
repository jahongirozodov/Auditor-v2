import "server-only";
import { cache } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type {
  AuditLogFilters,
  AuditLogPage,
  AuditLogView,
  LogCategory,
} from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

const CATEGORY_PREFIX: Record<Exclude<LogCategory, "all" | "error">, string> = {
  auth: "auth",
  finding: "finding",
  task: "task",
  config: "config",
};

function toView(r: {
  id: string;
  createdAt: Date;
  userId: string | null;
  user: { name: string; avatar: string } | null;
  action: string;
  entity: string | null;
  ip: string | null;
  device: string | null;
  level: string;
  payload?: Prisma.JsonValue;
}): AuditLogView {
  return {
    id: r.id,
    time: r.createdAt.toISOString(),
    userId: r.userId,
    userName: r.user?.name ?? null,
    avatar: r.user?.avatar ?? null,
    action: r.action,
    entity: r.entity ?? "—",
    ip: r.ip ?? "—",
    device: r.device ?? "—",
    level: r.level,
    payload: r.payload ?? undefined,
  };
}

const isAdmin = (role: RoleCode) => role === "super" || role === "head";

/** Base where (scope + date + actor + text) — category/level applied on top per query. */
function baseWhere(
  viewerId: string,
  role: RoleCode,
  f: AuditLogFilters,
): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = {};
  // "own" scope: non-admins only see their own actions (RBAC log = own).
  if (!isAdmin(role)) where.userId = viewerId;
  else if (f.actorId) where.userId = f.actorId;

  if (f.from || f.to) {
    where.createdAt = {
      ...(f.from ? { gte: new Date(f.from) } : {}),
      ...(f.to ? { lte: new Date(`${f.to}T23:59:59.999Z`) } : {}),
    };
  }
  if (f.q?.trim()) {
    const q = f.q.trim();
    where.OR = [
      { action: { contains: q, mode: "insensitive" } },
      { entity: { contains: q, mode: "insensitive" } },
      { ip: { contains: q, mode: "insensitive" } },
      { device: { contains: q, mode: "insensitive" } },
      { user: { name: { contains: q, mode: "insensitive" } } },
    ];
  }
  return where;
}

function applyCategoryLevel(
  base: Prisma.AuditLogWhereInput,
  f: AuditLogFilters,
): Prisma.AuditLogWhereInput {
  const where: Prisma.AuditLogWhereInput = { ...base };
  if (f.category === "error") where.level = { not: "info" };
  else if (f.category && f.category !== "all")
    where.action = { startsWith: CATEGORY_PREFIX[f.category] };
  if (f.level) where.level = f.level; // explicit level wins over the "error" category
  return where;
}

/**
 * Paginated, server-filtered, role-scoped audit-log query for the /logs viewer.
 * Cursor pagination (createdAt+id desc). Returns the page rows, the next cursor,
 * the total for the active filter, and per-category counts for the chip bar.
 */
export async function queryAuditLogs(
  viewerId: string,
  role: RoleCode,
  f: AuditLogFilters = {},
  cursor?: string,
  take = 50,
): Promise<AuditLogPage> {
  const base = baseWhere(viewerId, role, f);
  const where = applyCategoryLevel(base, f);

  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: take + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: { user: { select: { name: true, avatar: true } } },
  });

  const hasMore = rows.length > take;
  if (hasMore) rows.pop();

  // Chip counts: scope+date+actor+text, independent of the selected category/level.
  const [total, auth, finding, task, config, error] = await Promise.all([
    prisma.auditLog.count({ where: base }),
    prisma.auditLog.count({ where: { ...base, action: { startsWith: "auth" } } }),
    prisma.auditLog.count({ where: { ...base, action: { startsWith: "finding" } } }),
    prisma.auditLog.count({ where: { ...base, action: { startsWith: "task" } } }),
    prisma.auditLog.count({ where: { ...base, action: { startsWith: "config" } } }),
    prisma.auditLog.count({ where: { ...base, level: { not: "info" } } }),
  ]);

  return {
    rows: rows.map(toView),
    nextCursor: hasMore ? rows[rows.length - 1].id : null,
    total,
    counts: { all: total, auth, finding, task, config, error },
  };
}

/** All matching rows (capped) for CSV export — same scope + filters as the viewer. */
export async function getAuditLogsForExport(
  viewerId: string,
  role: RoleCode,
  f: AuditLogFilters = {},
  cap = 5000,
): Promise<AuditLogView[]> {
  const where = applyCategoryLevel(baseWhere(viewerId, role, f), f);
  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: cap,
    include: { user: { select: { name: true, avatar: true } } },
  });
  return rows.map(toView);
}

/**
 * Recent AuditLog rows (append-only journal written by every mutation + auth event),
 * newest first, joined with the actor. Capped — this is an operational viewer, not
 * an export. userId/ip/device may be null (e.g. failed logins).
 */
export const getAuditLogs = cache(async (limit = 250): Promise<AuditLogView[]> => {
  const rows = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { user: { select: { name: true, avatar: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    time: r.createdAt.toISOString(),
    userId: r.userId,
    userName: r.user?.name ?? null,
    avatar: r.user?.avatar ?? null,
    action: r.action,
    entity: r.entity ?? "—",
    ip: r.ip ?? "—",
    device: r.device ?? "—",
    level: r.level,
  }));
});
