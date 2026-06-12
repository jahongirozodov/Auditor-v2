"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { normalizePermissionList, requireAnyPermission } from "@/lib/rbac.server";
import { getOllamaConfig } from "@/lib/ai/ollama";
import { DEFAULT_SETTINGS, type CustomRole, type SettingsSection } from "@/lib/settings-defaults";
import { PERMISSIONS, ROLE_CODES, type PermissionId, type RoleCode } from "@/lib/types/roles";
import type { ActionResult } from "./types";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

const SaveInput = z.object({
  section: z.enum(["general", "ai", "notif", "security"]),
  values: z.record(z.string(), z.unknown()),
});

/**
 * Persist one settings section into the SystemSetting "system" row. Only keys known
 * to the section's default shape are stored (junk is dropped). Admin-only.
 */
export async function saveSettings(input: z.input<typeof SaveInput>): Promise<ActionResult> {
  const parsed = SaveInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { section, values } = parsed.data;

  const { userId } = await requireSession();
  if (!(await requireAnyPermission(userId, ["role.manage", "system.settings"])))
    return { ok: false, error: "forbidden" };

  const allowed = Object.keys(DEFAULT_SETTINGS[section as SettingsSection]);
  const clean = Object.fromEntries(Object.entries(values).filter(([k]) => allowed.includes(k)));

  const row = await prisma.systemSetting.findUnique({ where: { key: "system" } });
  const current = (row?.value as Record<string, unknown> | null) ?? {};
  const merged = {
    ...current,
    [section]: { ...((current[section] as object) ?? {}), ...clean },
  };

  await prisma.$transaction([
    prisma.systemSetting.upsert({
      where: { key: "system" },
      update: { value: J(merged) },
      create: { key: "system", value: J(merged) },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: "settings.update",
        entity: section,
        level: "info",
        payload: J({ section, keys: Object.keys(clean) }),
      },
    }),
  ]);

  revalidatePath("/settings");
  return { ok: true };
}

const KpiInput = z.object({
  rules: z.array(
    z.object({ code: z.string().min(1), points: z.number().int().min(-100).max(100) }),
  ),
});

/** Update KPI rule point values (the editable KPI section). Admin-only. */
export async function saveKpiRules(input: z.input<typeof KpiInput>): Promise<ActionResult> {
  const parsed = KpiInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { rules } = parsed.data;

  const { userId } = await requireSession();
  if (!(await requireAnyPermission(userId, ["role.manage", "system.settings"])))
    return { ok: false, error: "forbidden" };

  try {
    await prisma.$transaction([
      ...rules.map((r) =>
        prisma.kpiRule.update({ where: { code: r.code }, data: { points: r.points } }),
      ),
      prisma.auditLog.create({
        data: {
          userId,
          action: "settings.update",
          entity: "kpi.rules",
          level: "info",
          payload: J({ count: rules.length }),
        },
      }),
    ]);
  } catch {
    return { ok: false, error: "not_found" };
  }

  revalidatePath("/settings");
  revalidatePath("/kpi");
  return { ok: true };
}

/** Probe the local Ollama endpoint (Sozlamalar → AI: "Ulanishni tekshirish"). Admin-only. */
export async function testOllama(): Promise<{ ok: boolean; model?: string; error?: string }> {
  const { userId } = await requireSession();
  if (!(await requireAnyPermission(userId, ["role.manage", "system.settings"])))
    return { ok: false, error: "forbidden" };
  const { url, model } = getOllamaConfig();
  try {
    // OpenAI-compatible health check — works for both Ollama (/v1/models) and LM Studio
    const resp = await fetch(`${url}/v1/models`, { signal: AbortSignal.timeout(5000) });
    if (!resp.ok) return { ok: false, error: "unreachable" };
    return { ok: true, model };
  } catch {
    return { ok: false, error: "unreachable" };
  }
}

const AddRoleInput = z.object({
  name: z.string().min(2).max(64),
  code: z
    .string()
    .min(2)
    .max(32)
    .regex(/^[a-z0-9_]+$/),
  baseRole: z.enum(ROLE_CODES).optional(),
  permissions: z.array(z.enum(PERMISSIONS)).default([]),
  description: z.string().max(240).optional(),
  base: z.string().default("—"),
});

async function readCustomRoles(): Promise<CustomRole[]> {
  const row = await prisma.systemSetting.findUnique({ where: { key: "custom_roles" } });
  const raw: unknown[] = Array.isArray(row?.value) ? row.value : [];
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
}

async function writeCustomRoles(userId: string, list: CustomRole[]) {
  await prisma.$transaction([
    prisma.systemSetting.upsert({
      where: { key: "custom_roles" },
      update: { value: J(list) },
      create: { key: "custom_roles", value: J(list) },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: "settings.update",
        entity: "custom_roles",
        level: "info",
        payload: J({ count: list.length }),
      },
    }),
  ]);
  revalidatePath("/settings");
}

export async function addCustomRole(input: z.input<typeof AddRoleInput>): Promise<ActionResult> {
  const parsed = AddRoleInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { name, code, baseRole, permissions, description } = parsed.data;

  const { userId } = await requireSession();
  if (!(await requireAnyPermission(userId, ["role.manage", "system.settings"])))
    return { ok: false, error: "forbidden" };

  const list = await readCustomRoles();
  if (list.some((r) => r.code === code)) return { ok: false, error: "duplicate" };
  await writeCustomRoles(userId, [
    ...list,
    {
      name,
      code,
      baseRole: baseRole ?? "t1",
      permissions: normalizePermissionList(permissions),
      description,
      tone: "tag--info",
    },
  ]);
  return { ok: true };
}

export async function updateCustomRole(input: z.input<typeof AddRoleInput>): Promise<ActionResult> {
  const parsed = AddRoleInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { name, code, baseRole, permissions, description } = parsed.data;

  const { userId } = await requireSession();
  if (!(await requireAnyPermission(userId, ["role.manage", "system.settings"])))
    return { ok: false, error: "forbidden" };

  const list = await readCustomRoles();
  const index = list.findIndex((r) => r.code === code);
  if (index < 0) return { ok: false, error: "not_found" };

  const next = [...list];
  next[index] = {
    ...next[index],
    name,
    code,
    baseRole: baseRole ?? next[index].baseRole,
    permissions: normalizePermissionList(permissions),
    description,
  };
  await writeCustomRoles(userId, next);
  return { ok: true };
}

export async function deleteCustomRole(input: { code: string }): Promise<ActionResult> {
  const code = String(input?.code ?? "");
  if (!code) return { ok: false, error: "invalid" };

  const { userId } = await requireSession();
  if (!(await requireAnyPermission(userId, ["role.manage", "system.settings"])))
    return { ok: false, error: "forbidden" };

  const list = await readCustomRoles();
  await writeCustomRoles(
    userId,
    list.filter((r) => r.code !== code),
  );
  return { ok: true };
}

const SaveRolePermissionsInput = z.object({
  role: z.enum(ROLE_CODES),
  permissions: z.array(z.enum(PERMISSIONS)),
});

export async function saveRolePermissions(
  input: z.input<typeof SaveRolePermissionsInput>,
): Promise<ActionResult> {
  const parsed = SaveRolePermissionsInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { role, permissions } = parsed.data;
  if (role === "super") return { ok: false, error: "immutable" };

  const { userId } = await requireSession();
  if (!(await requireAnyPermission(userId, ["role.manage", "system.settings"])))
    return { ok: false, error: "forbidden" };

  const row = await prisma.systemSetting.findUnique({ where: { key: "system_role_permissions" } });
  const current = isRecord(row?.value) ? row.value : {};
  const next: Partial<Record<RoleCode, PermissionId[]>> = {};
  for (const [key, value] of Object.entries(current)) {
    if (ROLE_CODES.includes(key as RoleCode) && key !== "super") {
      next[key as RoleCode] = normalizePermissionList(value);
    }
  }
  next[role] = normalizePermissionList(permissions);

  await prisma.$transaction([
    prisma.systemSetting.upsert({
      where: { key: "system_role_permissions" },
      update: { value: J(next) },
      create: { key: "system_role_permissions", value: J(next) },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: "settings.permissions.update",
        entity: `role:${role}`,
        level: "info",
        payload: J({ role, count: next[role]?.length ?? 0 }),
      },
    }),
  ]);

  revalidatePath("/permissions");
  revalidatePath("/settings");
  return { ok: true };
}
