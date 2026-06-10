import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { getAuditLogsForExport } from "@/lib/data/logs";
import type { AuditLogFilters, LogCategory } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORIES: LogCategory[] = ["all", "auth", "finding", "task", "config", "error"];
const LEVELS = ["info", "warn", "danger"] as const;

function csvCell(v: unknown): string {
  const s = v == null ? "" : typeof v === "string" ? v : JSON.stringify(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** CSV export of the audit log, honouring the viewer's role scope + active filters. */
export async function GET(req: Request) {
  const { userId, role } = await requireSession();
  if (!(await requirePermission(userId, "system.audit_log")))
    return Response.json({ error: "forbidden" }, { status: 403 });

  const p = new URL(req.url).searchParams;
  const category = p.get("category");
  const level = p.get("level");
  const filters: AuditLogFilters = {
    from: p.get("from") || undefined,
    to: p.get("to") || undefined,
    q: p.get("q") || undefined,
    actorId: p.get("actorId") || undefined,
    category: category && CATEGORIES.includes(category as LogCategory) ? (category as LogCategory) : undefined,
    level: level && (LEVELS as readonly string[]).includes(level) ? (level as AuditLogFilters["level"]) : undefined,
  };

  const rows = await getAuditLogsForExport(userId, role as RoleCode, filters);
  const header = ["time", "level", "userId", "userName", "action", "entity", "ip", "device", "payload"];
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      [r.time, r.level, r.userId ?? "", r.userName ?? "", r.action, r.entity, r.ip, r.device, r.payload]
        .map(csvCell)
        .join(","),
    ),
  ];
  const csv = "﻿" + lines.join("\n"); // BOM so Excel reads UTF-8

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="audit-log.csv"`,
    },
  });
}
