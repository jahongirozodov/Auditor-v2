import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_CUSTOM_ROLES,
  DEFAULT_SETTINGS,
  type CustomRole,
  type SystemSettings,
} from "@/lib/settings-defaults";
import { normalizePermissionList } from "@/lib/rbac.server";
import type { KpiRule } from "@/lib/types/entities";
import { ROLE_CODES, type RoleCode } from "@/lib/types/roles";

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

/** Merge stored system settings over the defaults (missing keys always resolve). */
export const getSystemSettings = cache(async (): Promise<SystemSettings> => {
  const row = await prisma.systemSetting.findUnique({ where: { key: "system" } });
  const s = (row?.value as Partial<SystemSettings> | null) ?? {};
  return {
    general: { ...DEFAULT_SETTINGS.general, ...s.general },
    ai: { ...DEFAULT_SETTINGS.ai, ...s.ai },
    notif: { ...DEFAULT_SETTINGS.notif, ...s.notif },
    security: { ...DEFAULT_SETTINGS.security, ...s.security },
  };
});

export const getCustomRoles = cache(async (): Promise<CustomRole[]> => {
  const row = await prisma.systemSetting.findUnique({ where: { key: "custom_roles" } });
  const raw: unknown[] = Array.isArray(row?.value) ? row.value : DEFAULT_CUSTOM_ROLES;
  return raw
    .filter(isRecord)
    .map((r) => ({
      name: String(r.name ?? ""),
      code: String(r.code ?? ""),
      baseRole: ROLE_CODES.includes(r.baseRole as RoleCode) ? (r.baseRole as RoleCode) : "t1",
      permissions: normalizePermissionList(r.permissions),
      description: typeof r.description === "string" ? r.description : undefined,
      tone: typeof r.tone === "string" ? r.tone : "tag--info",
    }))
    .filter((r) => r.name && r.code);
});

/** KPI rules from the KpiRule table, highest points first (matches the prototype). */
export const getKpiRules = cache(async (): Promise<KpiRule[]> => {
  const rows = await prisma.kpiRule.findMany({ orderBy: { points: "desc" } });
  return rows.map((r) => ({ code: r.code, label: r.label, points: r.points }));
});
