import "server-only";
import { prisma } from "@/lib/prisma";
import {
  MODULES,
  PERMISSIONS,
  ROLE_CODES,
  type AccessLevel,
  type ModuleId,
  type PermissionId,
  type RoleCode,
} from "@/lib/types/roles";

export type EffectivePermissions = readonly PermissionId[] | readonly ["*"];

type PermissionSetting = Partial<Record<RoleCode, PermissionId[]>>;
export type RolePermissionSnapshot = {
  role: RoleCode;
  permissions: EffectivePermissions;
  access: Record<ModuleId, AccessLevel>;
};

const PERMISSION_SET = new Set<string>(PERMISSIONS);
const ROLE_SET = new Set<string>(ROLE_CODES);

const SYSTEM_ROLE_ACCESS: Record<ModuleId, Record<RoleCode, AccessLevel>> = {
  users: { super: "full", head: "read", chief: "no", lead: "no", t1: "no" },
  org: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  audit: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  group: { super: "full", head: "full", chief: "no", lead: "no", t1: "no" },
  leader: { super: "full", head: "full", chief: "no", lead: "no", t1: "no" },
  project: { super: "read", head: "full", chief: "own", lead: "own", t1: "own" },
  assign: { super: "read", head: "read", chief: "own", lead: "own", t1: "own" },
  mytasks: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  finding: { super: "full", head: "full", chief: "full", lead: "full", t1: "own" },
  config: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  agent: { super: "no", head: "read", chief: "full", lead: "full", t1: "full" },
  token: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  ai: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  kpi: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  report: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  log: { super: "full", head: "read", chief: "own", lead: "own", t1: "own" },
  settings: { super: "full", head: "full", chief: "no", lead: "no", t1: "no" },
  appeal: { super: "full", head: "own", chief: "own", lead: "own", t1: "own" },
};

export const MODULE_PERMISSION_GROUPS: Record<
  ModuleId,
  { read: PermissionId[]; own: PermissionId[]; full: PermissionId[] }
> = {
  users: {
    read: [],
    own: [],
    full: ["user.create", "user.update", "user.disable"],
  },
  org: {
    read: ["org.view_all"],
    own: ["org.view_own"],
    full: [
      "org.create",
      "org.update",
      "org.delete",
      "org.view_all",
      "org.manage_contacts",
      "org.manage_devices",
    ],
  },
  audit: {
    read: ["audit.view_all"],
    own: ["audit.view_own"],
    full: ["audit.create", "audit.update", "audit.delete", "audit.approve", "audit.view_all"],
  },
  group: {
    read: [],
    own: [],
    full: ["group.form", "group.edit"],
  },
  leader: {
    read: [],
    own: [],
    full: ["group.form", "group.edit"],
  },
  project: {
    read: ["audit.view_all"],
    own: ["audit.view_own"],
    full: ["audit.update", "audit.approve", "audit.view_all"],
  },
  assign: {
    read: ["task.view_group"],
    own: ["task.view_own"],
    full: ["task.assign", "task.view_group"],
  },
  mytasks: {
    read: ["task.view_group"],
    own: ["task.view_own", "task.update_status"],
    full: ["task.assign", "task.view_group", "task.update_status"],
  },
  finding: {
    read: [],
    own: ["finding.create"],
    full: ["finding.create", "finding.approve", "finding.reject"],
  },
  config: {
    read: ["scanner.import"],
    own: ["config.upload", "scanner.import", "traffic.upload", "ai.use"],
    full: ["config.upload", "scanner.import", "traffic.upload", "ai.use"],
  },
  agent: {
    read: [],
    own: ["agent.token"],
    full: ["agent.token", "agent.revoke"],
  },
  token: {
    read: [],
    own: ["agent.token"],
    full: ["agent.token", "agent.revoke"],
  },
  ai: {
    read: [],
    own: ["ai.use"],
    full: ["ai.use"],
  },
  kpi: {
    read: ["kpi.view_own"],
    own: ["kpi.view_own"],
    full: ["kpi.view_own", "kpi.view_all"],
  },
  report: {
    read: [],
    own: ["report.create", "report.export"],
    full: ["report.create", "report.approve", "report.export"],
  },
  log: {
    read: ["system.audit_log"],
    own: ["system.audit_log"],
    full: ["system.audit_log"],
  },
  settings: {
    read: [],
    own: [],
    full: ["system.settings", "role.manage"],
  },
  appeal: {
    read: [],
    own: ["appeal.create"],
    full: ["appeal.create", "appeal.manage"],
  },
};

export const SYSTEM_ROLE_DEFAULT_PERMISSIONS: Record<RoleCode, EffectivePermissions> = {
  super: ["*"],
  head: permissionsFromAccessMatrix("head"),
  chief: permissionsFromAccessMatrix("chief"),
  lead: permissionsFromAccessMatrix("lead"),
  t1: permissionsFromAccessMatrix("t1"),
};

function permissionsFromAccessMatrix(role: RoleCode): PermissionId[] {
  const out = new Set<PermissionId>();
  for (const m of MODULES) {
    const level = SYSTEM_ROLE_ACCESS[m.id][role];
    const group = MODULE_PERMISSION_GROUPS[m.id];
    const permissions =
      level === "full"
        ? group.full
        : level === "own"
          ? group.own
          : level === "read"
            ? group.read
            : [];
    for (const p of permissions) out.add(p);
  }
  return [...out];
}

export function isRoleCode(value: unknown): value is RoleCode {
  return typeof value === "string" && ROLE_SET.has(value);
}

export function isPermissionId(value: unknown): value is PermissionId {
  return typeof value === "string" && PERMISSION_SET.has(value);
}

export function normalizePermissionList(values: unknown): PermissionId[] {
  if (!Array.isArray(values)) return [];
  const out: PermissionId[] = [];
  for (const value of values) {
    if (isPermissionId(value) && !out.includes(value)) out.push(value);
  }
  return out;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function isWildcard(permissions: EffectivePermissions): permissions is readonly ["*"] {
  return permissions[0] === "*";
}

function normalizeSystemOverrides(value: unknown): PermissionSetting {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: PermissionSetting = {};
  for (const [role, permissions] of Object.entries(value)) {
    if (isRoleCode(role) && role !== "super") out[role] = normalizePermissionList(permissions);
  }
  return out;
}

export function hasPermission(
  permissions: EffectivePermissions,
  required: PermissionId | readonly PermissionId[],
): boolean {
  if (isWildcard(permissions)) return true;
  const granted = permissions as readonly PermissionId[];
  const requiredList = Array.isArray(required) ? required : [required];
  return requiredList.every((p) => granted.includes(p));
}

export function hasAnyPermission(
  permissions: EffectivePermissions,
  required: PermissionId | readonly PermissionId[],
): boolean {
  if (isWildcard(permissions)) return true;
  const granted = permissions as readonly PermissionId[];
  const requiredList = Array.isArray(required) ? required : [required];
  return requiredList.some((p) => granted.includes(p));
}

export function deriveAccessForModule(
  permissions: EffectivePermissions,
  moduleId: ModuleId,
): AccessLevel {
  if (isWildcard(permissions)) return "full";
  const granted = permissions as readonly PermissionId[];
  const group = MODULE_PERMISSION_GROUPS[moduleId];
  const fullOnly = group.full.filter((p) => !group.read.includes(p) && !group.own.includes(p));
  if (fullOnly.some((p) => granted.includes(p))) return "full";
  if (group.read.length > 0 && group.read.every((p) => granted.includes(p))) return "read";
  if (group.own.length > 0 && group.own.every((p) => granted.includes(p))) return "own";
  if (group.own.some((p) => granted.includes(p))) return "own";
  if (group.read.some((p) => granted.includes(p))) return "read";
  return "no";
}

export async function getSystemRolePermissionOverrides(): Promise<PermissionSetting> {
  const row = await prisma.systemSetting.findUnique({ where: { key: "system_role_permissions" } });
  return normalizeSystemOverrides(row?.value);
}

export async function getRolePermissions(role: RoleCode): Promise<EffectivePermissions> {
  if (role === "super") return ["*"];
  const overrides = await getSystemRolePermissionOverrides();
  return overrides[role] ?? SYSTEM_ROLE_DEFAULT_PERMISSIONS[role];
}

export async function getPermissionMatrixSnapshot(): Promise<RolePermissionSnapshot[]> {
  const overrides = await getSystemRolePermissionOverrides();
  return ROLE_CODES.map((role) => {
    const permissions: EffectivePermissions =
      role === "super" ? ["*"] : (overrides[role] ?? SYSTEM_ROLE_DEFAULT_PERMISSIONS[role]);
    return {
      role,
      permissions,
      access: Object.fromEntries(
        MODULES.map((m) => [m.id, deriveAccessForModule(permissions, m.id)]),
      ) as Record<ModuleId, AccessLevel>,
    };
  });
}

export async function getEffectivePermissionsForUser(
  userId: string,
): Promise<EffectivePermissions> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { role: true, customRoleCode: true },
  });
  if (!user || !isRoleCode(user.role)) return [];
  if (user.role === "super") return ["*"];

  if (user.customRoleCode) {
    const row = await prisma.systemSetting.findUnique({ where: { key: "custom_roles" } });
    const customRoles: unknown[] = Array.isArray(row?.value) ? row.value : [];
    const match = customRoles.filter(isRecord).find((r) => r.code === user.customRoleCode);
    if (match) return normalizePermissionList(match.permissions);
  }

  const overrides = await getSystemRolePermissionOverrides();
  return overrides[user.role] ?? SYSTEM_ROLE_DEFAULT_PERMISSIONS[user.role];
}

export async function userHasPermission(
  userId: string,
  required: PermissionId | readonly PermissionId[],
): Promise<boolean> {
  return hasPermission(await getEffectivePermissionsForUser(userId), required);
}

export async function userHasAnyPermission(
  userId: string,
  required: PermissionId | readonly PermissionId[],
): Promise<boolean> {
  return hasAnyPermission(await getEffectivePermissionsForUser(userId), required);
}

export async function requirePermission(
  userId: string,
  required: PermissionId | readonly PermissionId[],
): Promise<boolean> {
  return userHasPermission(userId, required);
}

export async function requireAnyPermission(
  userId: string,
  required: PermissionId | readonly PermissionId[],
): Promise<boolean> {
  return userHasAnyPermission(userId, required);
}
