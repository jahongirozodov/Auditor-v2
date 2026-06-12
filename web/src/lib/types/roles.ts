/**
 * Roles, duties, and access primitives.
 * Canonical role codes are the TZ codes (ADR-0006): super/head/chief/lead/t1.
 * The prototype's data.js uses different codes — see PROTOTYPE_ROLE_MAP.
 */

export const ROLE_CODES = ["super", "head", "chief", "lead", "t1"] as const;
export type RoleCode = (typeof ROLE_CODES)[number];

export interface RoleMeta {
  code: RoleCode;
  /** Uzbek display name (label only — never used as an identifier). */
  name: string;
  /** Short label for dense UI. */
  short: string;
  /** Hierarchy: 1 = highest (super) … 5 = lowest (t1). */
  order: number;
  /** Numeric level from the TZ (100 → 20). */
  level: number;
}

export const ROLES: readonly RoleMeta[] = [
  { code: "super", name: "Departament rahbari", short: "Departament", order: 1, level: 100 },
  { code: "head", name: "Boʻlim boshligʻi", short: "Boʻlim boshligʻi", order: 2, level: 80 },
  { code: "chief", name: "Bosh mutaxassis", short: "Bosh m-s", order: 3, level: 60 },
  { code: "lead", name: "Yetakchi mutaxassis", short: "Yetakchi m-s", order: 4, level: 40 },
  { code: "t1", name: "Birinchi toifali mutaxassis", short: "1-toifa m-s", order: 5, level: 20 },
];

/** Prototype (data.js) role code → canonical role code. See ADR-0006. */
export const PROTOTYPE_ROLE_MAP: Record<string, RoleCode> = {
  departament: "super",
  bolim: "head",
  bosh: "chief",
  yetakchi: "lead",
  toifa1: "t1",
};

/** Team-level duty (independent of system role). */
export type Duty = "group_lead" | "auditor";

/** Per-(role, module) access level used for UI gating. */
export type AccessLevel = "full" | "read" | "own" | "no";

/** Modules used by the access matrix and the permissions screen (Uzbek labels). */
export const MODULES = [
  { id: "users", name: "Foydalanuvchilar" },
  { id: "org", name: "Tashkilotlar kartasi" },
  { id: "audit", name: "Audit kartasi" },
  { id: "group", name: "Audit guruhini shakllash" },
  { id: "leader", name: "Guruh rahbarini tanlash" },
  { id: "project", name: "Audit loyihasi" },
  { id: "assign", name: "Vazifalarni biriktirish" },
  { id: "mytasks", name: "Oʻz vazifalarini koʻrish" },
  { id: "finding", name: "Kamchilik/zaiflik" },
  { id: "config", name: "Konfiguratsiya tahlili" },
  { id: "agent", name: "EXE agent" },
  { id: "token", name: "Audit token" },
  { id: "ai", name: "AI tahlil" },
  { id: "kpi", name: "KPI" },
  { id: "report", name: "Hisobotlar" },
  { id: "log", name: "Audit log" },
  { id: "settings", name: "Sozlamalar" },
  { id: "appeal", name: "Murojaatlar" },
] as const;

export type ModuleId = (typeof MODULES)[number]["id"];

/**
 * Fine-grained permission catalog (module.action) from TZ §4.4 / docs/02.
 * This is the BACKEND authorization model (Phase 1+); role→permission resolution
 * is finalized with the backend. UI gating uses the AccessLevel matrix in rbac.ts.
 */
export const PERMISSIONS = [
  "org.create",
  "org.update",
  "org.delete",
  "org.view_all",
  "org.view_own",
  "org.manage_contacts",
  "org.manage_devices",
  "audit.create",
  "audit.update",
  "audit.delete",
  "audit.approve",
  "audit.view_all",
  "audit.view_own",
  "group.form",
  "group.edit",
  "task.assign",
  "task.view_own",
  "task.view_group",
  "task.update_status",
  "finding.create",
  "finding.approve",
  "finding.reject",
  "config.upload",
  "scanner.import",
  "traffic.upload",
  "ai.use",
  "report.create",
  "report.approve",
  "report.export",
  "kpi.view_own",
  "kpi.view_all",
  "user.create",
  "user.update",
  "user.disable",
  "role.manage",
  "system.settings",
  "system.audit_log",
  "agent.token",
  "agent.revoke",
  "appeal.create",
  "appeal.manage",
] as const;

export type PermissionId = (typeof PERMISSIONS)[number];

/** Analysis-access permissions — the "tahlilchi" capability is THIS, not a role. */
export const ANALYST_PERMISSIONS: readonly PermissionId[] = [
  "config.upload",
  "scanner.import",
  "traffic.upload",
  "ai.use",
];
