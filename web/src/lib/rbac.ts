/**
 * Role-based access control — UI gating layer.
 *
 * `can(role, module)` returns the access level for a (canonical) role on a module,
 * ported from the prototype's permission matrix (data.js PERM_MODULES, columns
 * d/b/bs/y/t1 → super/head/chief/lead/t1). This drives sidebar visibility and page
 * guards.
 *
 * IMPORTANT: this is the UI gate only. Every server mutation must re-check
 * authorization on the backend against the fine-grained PERMISSIONS catalog +
 * ownership/duty + DB RLS (see docs/08-security.md). A UI gate is never sufficient.
 */
import type { AccessLevel, ModuleId, RoleCode } from "./types/roles";

/** access[module][role] — verbatim from the prototype's PERM_MODULES matrix. */
const ACCESS: Record<ModuleId, Record<RoleCode, AccessLevel>> = {
  users: { super: "full", head: "read", chief: "no", lead: "no", t1: "no" },
  org: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  audit: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  group: { super: "read", head: "full", chief: "no", lead: "no", t1: "no" },
  leader: { super: "read", head: "full", chief: "no", lead: "no", t1: "no" },
  project: { super: "read", head: "full", chief: "own", lead: "own", t1: "own" },
  assign: { super: "read", head: "read", chief: "own", lead: "own", t1: "own" },
  mytasks: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  finding: { super: "full", head: "read", chief: "own", lead: "own", t1: "own" },
  agent: { super: "no", head: "read", chief: "full", lead: "full", t1: "full" },
  token: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  ai: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  kpi: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  report: { super: "full", head: "full", chief: "own", lead: "own", t1: "own" },
  log: { super: "full", head: "read", chief: "own", lead: "own", t1: "own" },
};

/** Access level a role has on a module ("no" if the module is unknown). */
export function can(role: RoleCode, module: ModuleId): AccessLevel {
  return ACCESS[module]?.[role] ?? "no";
}

/** True if the role can see the module at all (any level above "no"). */
export function canView(role: RoleCode, module: ModuleId): boolean {
  return can(role, module) !== "no";
}

/** True if the role has unrestricted access to the module. */
export function canManage(role: RoleCode, module: ModuleId): boolean {
  return can(role, module) === "full";
}
