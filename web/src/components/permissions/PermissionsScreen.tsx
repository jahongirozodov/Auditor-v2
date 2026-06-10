"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import {
  Briefcase,
  Check,
  Download,
  Edit3,
  Eye,
  ShieldCheck,
  Star,
  User,
  UserCheck,
  X,
  type LucideIcon,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import {
  MODULES,
  PERMISSIONS,
  ROLES,
  type AccessLevel,
  type ModuleId,
  type PermissionId,
  type RoleCode,
} from "@/lib/types/roles";
import { can } from "@/lib/rbac";
import { saveRolePermissions } from "@/lib/actions/settings";
import type { RolePermissionSnapshot } from "@/lib/rbac.server";

const PERM: Record<AccessLevel, { cls: string; Icon: LucideIcon; key: AccessLevel }> = {
  full: { cls: "perm--full", Icon: Check, key: "full" },
  read: { cls: "perm--read", Icon: Eye, key: "read" },
  own: { cls: "perm--partial", Icon: User, key: "own" },
  no: { cls: "perm--no", Icon: X, key: "no" },
};

const ROLE_ICON: Record<RoleCode, LucideIcon> = {
  super: ShieldCheck,
  head: Briefcase,
  chief: Star,
  lead: User,
  t1: UserCheck,
};

const MODULE_PERMISSION_MATCH: Record<ModuleId, string[]> = {
  users: ["user."],
  org: ["org."],
  audit: ["audit."],
  group: ["group."],
  leader: ["group."],
  project: ["audit."],
  assign: ["task."],
  mytasks: ["task."],
  finding: ["finding."],
  config: ["config.", "scanner.", "traffic.", "ai."],
  agent: ["agent."],
  token: ["agent."],
  ai: ["ai."],
  kpi: ["kpi."],
  report: ["report."],
  log: ["system.audit_log"],
  settings: ["system.settings", "role.manage"],
};

const FULL_HINTS = [
  ".create",
  ".update",
  ".delete",
  ".approve",
  ".reject",
  ".assign",
  ".revoke",
  ".settings",
  "role.manage",
  ".manage_",
];

function defaultMatrix(): RolePermissionSnapshot[] {
  return ROLES.map((r) => ({
    role: r.code,
    permissions: r.code === "super" ? ["*"] : [],
    access: Object.fromEntries(MODULES.map((m) => [m.id, can(r.code, m.id)])) as Record<
      ModuleId,
      AccessLevel
    >,
  }));
}

function deriveLocalAccess(
  permissions: readonly PermissionId[] | readonly ["*"],
  moduleId: ModuleId,
): AccessLevel {
  if (permissions.includes("*" as never)) return "full";
  const relevant = permissions.filter((p) =>
    MODULE_PERMISSION_MATCH[moduleId].some((prefix) => p.startsWith(prefix) || p === prefix),
  );
  if (relevant.length === 0) return "no";
  if (relevant.some((p) => FULL_HINTS.some((hint) => p.includes(hint)))) return "full";
  if (relevant.some((p) => p.includes("view_own") || p.includes("update_status"))) return "own";
  return "read";
}

export function PermissionsScreen({ matrix }: { matrix?: RolePermissionSnapshot[] }) {
  const t = useTranslations("permissions");
  const tNav = useTranslations("nav");
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [editMode, setEditMode] = useState(false);
  const [rows, setRows] = useState<RolePermissionSnapshot[]>(() => matrix ?? defaultMatrix());
  const [editing, setEditing] = useState<{ role: RoleCode; module: ModuleId } | null>(null);
  const [draft, setDraft] = useState<PermissionId[]>([]);
  const rowByRole = useMemo(() => Object.fromEntries(rows.map((r) => [r.role, r])), [rows]);

  const cellValue = (m: ModuleId, r: RoleCode): AccessLevel => rowByRole[r]?.access[m] ?? can(r, m);

  function discard() {
    setEditing(null);
    setDraft([]);
    setEditMode(false);
  }
  function save() {
    if (!editing) return;
    startTransition(async () => {
      const res = await saveRolePermissions({ role: editing.role, permissions: draft });
      if (!res.ok) {
        toast(t("failed"), "danger");
        return;
      }
      setRows((current) =>
        current.map((row) =>
          row.role === editing.role
            ? {
                ...row,
                permissions: draft,
                access: Object.fromEntries(
                  MODULES.map((m) => [m.id, deriveLocalAccess(draft, m.id)]),
                ) as Record<ModuleId, AccessLevel>,
              }
            : row,
        ),
      );
      toast(t("saved"), "success");
      setEditing(null);
      setDraft([]);
      setEditMode(false);
    });
  }

  function openEditor(role: RoleCode, module: ModuleId) {
    if (!editMode || role === "super") return;
    const permissions = rowByRole[role]?.permissions ?? [];
    setEditing({ role, module });
    setDraft(permissions.includes("*" as never) ? [] : [...(permissions as PermissionId[])]);
  }

  function togglePermission(permission: PermissionId) {
    setDraft((current) =>
      current.includes(permission)
        ? current.filter((p) => p !== permission)
        : [...current, permission],
    );
  }

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: tNav("dashboard"), href: "/dashboard" }, { label: t("crumb") }]}
        title={t("title")}
        sub={t("sub")}
        actions={
          editMode ? (
            <>
              <Button size="sm" variant="ghost" icon={<X size={14} />} onClick={discard}>
                {t("cancel")}
              </Button>
              <Button
                size="sm"
                variant="primary"
                icon={<Check size={14} />}
                onClick={save}
                disabled={!editing || pending}
              >
                {editing ? t("save") : t("save")}
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                icon={<Download size={14} />}
                onClick={() => toast(t("exported"), "success")}
              >
                {t("export")}
              </Button>
              <Button
                size="sm"
                variant="secondary"
                icon={<Edit3 size={14} />}
                onClick={() => setEditMode(true)}
              >
                {t("editMode")}
              </Button>
            </>
          )
        }
      />

      {editMode && (
        <div className="edit-banner">
          <span className="edit-banner__icon">
            <Edit3 size={14} />
          </span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="edit-banner__title">{t("editBannerTitle")}</div>
            <div className="edit-banner__sub">{t("editBannerSub")}</div>
          </div>
          {editing ? <span className="tag tag--brand">{editing.role}</span> : null}
        </div>
      )}

      <div
        className="card card__pad-sm"
        style={{
          marginBottom: 14,
          display: "flex",
          gap: 18,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span
          className="text-sm font-bold text-muted"
          style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
        >
          {t("legend")}
        </span>
        {(["full", "read", "own", "no"] as AccessLevel[]).map((v) => {
          const { cls, Icon } = PERM[v];
          return (
            <span
              key={v}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12,
                color: "var(--text-secondary)",
              }}
            >
              <span className={`perm ${cls}`}>
                <Icon size={14} />
              </span>
              <span>{t(v)}</span>
            </span>
          );
        })}
      </div>

      <div className={`tbl-wrap${editMode ? " matrix-wrap--edit" : ""}`}>
        <div className="tbl-scroll">
          <table className="matrix">
            <thead>
              <tr>
                <th style={{ textAlign: "left" }}>{t("colModule")}</th>
                {ROLES.map((r) => {
                  const RI = ROLE_ICON[r.code];
                  return (
                    <th key={r.code}>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 2,
                          alignItems: "center",
                        }}
                      >
                        <RI size={16} style={{ color: "var(--brand)" }} />
                        <span>{r.short}</span>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => (
                <tr key={m.id}>
                  <th>{m.name}</th>
                  {ROLES.map((r) => {
                    const v = cellValue(m.id, r.code);
                    const { cls, Icon, key } = PERM[v];
                    const changed = editMode && editing?.role === r.code && editing.module === m.id;
                    const editable = editMode && r.code !== "super";
                    return (
                      <td key={r.code}>
                        <span
                          className={`perm ${cls}${editable ? " perm--editable" : ""}${changed ? " perm--changed" : ""}`}
                          title={editable ? t("cellHint", { label: t(key) }) : t(key)}
                          role={editable ? "button" : undefined}
                          tabIndex={editable ? 0 : undefined}
                          onClick={editable ? () => openEditor(r.code, m.id) : undefined}
                          onKeyDown={
                            editable
                              ? (e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    e.preventDefault();
                                    openEditor(r.code, m.id);
                                  }
                                }
                              : undefined
                          }
                        >
                          <Icon size={14} />
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!editing}
        onClose={() => {
          setEditing(null);
          setDraft([]);
        }}
        title={editing ? t("drawerTitle", { role: editing.role }) : t("drawerTitle", { role: "" })}
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={discard} disabled={pending}>
              {t("cancel")}
            </Button>
            <Button size="sm" variant="primary" onClick={save} disabled={pending || !editing}>
              {t("save")}
            </Button>
          </>
        }
      >
        <div style={{ display: "grid", gap: 10 }}>
          {PERMISSIONS.map((permission) => {
            const checked = draft.includes(permission);
            const highlighted = editing
              ? MODULE_PERMISSION_MATCH[editing.module].some(
                  (prefix) => permission.startsWith(prefix) || permission === prefix,
                )
              : false;
            return (
              <label
                key={permission}
                className="set-row"
                style={{
                  padding: "8px 10px",
                  borderRadius: 8,
                  border: highlighted ? "1px solid var(--brand)" : "1px solid var(--border-soft)",
                }}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => togglePermission(permission)}
                />
                <span className="font-mono text-sm">{permission}</span>
              </label>
            );
          })}
        </div>
      </Modal>
    </div>
  );
}
