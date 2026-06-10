"use server";

import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { queryAuditLogs } from "@/lib/data/logs";
import type { AuditLogFilters, AuditLogPage } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

const EMPTY: AuditLogPage = {
  rows: [],
  nextCursor: null,
  total: 0,
  counts: { all: 0, auth: 0, finding: 0, task: 0, config: 0, error: 0 },
};

/**
 * Read-side RPC for the /logs viewer: session-gated, role-scoped (non-admins see
 * only their own actions), server-filtered + cursor-paginated. Drives both the
 * initial filter changes and "load more".
 */
export async function fetchAuditLogs(
  filters: AuditLogFilters,
  cursor?: string,
): Promise<AuditLogPage> {
  const { userId, role } = await requireSession();
  if (!(await requirePermission(userId, "system.audit_log"))) return EMPTY;
  return queryAuditLogs(userId, role as RoleCode, filters, cursor);
}
