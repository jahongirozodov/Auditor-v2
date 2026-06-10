"use client";

import { useState, useTransition, useMemo } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Edit3, Lock, LockOpen, Plus, Search, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import { UserFormModal, ROLE_OPTIONS } from "./UserFormModal";
import { toggleUserLock, deleteUser } from "@/lib/actions/users";
import type { CustomRole } from "@/lib/settings-defaults";
import type { AdminUserView } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";
import type { KpiUser } from "@/lib/types/entities";

const ROLE_TAG: Record<RoleCode, string> = {
  super: "tag--brand",
  head: "tag--brand",
  chief: "tag--info",
  lead: "tag--outline",
  t1: "tag--outline",
};

function fmtLastLogin(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const min = Math.floor(diff / 60_000);
  if (min < 2) return "Hozirgina";
  if (min < 60) return `${min} daqiqa`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} soat`;
  const days = Math.floor(h / 24);
  if (days === 1) return "Kecha";
  return `${days} kun`;
}

export interface UsersScreenProps {
  users: AdminUserView[];
  kpi: KpiUser[];
  canEdit: boolean;
  customRoles?: CustomRole[];
}

export function UsersScreen({ users: initial, kpi, canEdit, customRoles = [] }: UsersScreenProps) {
  const t = useTranslations("users");
  const tNav = useTranslations("nav");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [query, setQuery] = useState("");
  const [modalOpen, setModal] = useState(false);
  const [editing, setEditing] = useState<AdminUserView | null>(null);

  const kpiMap = useMemo(() => Object.fromEntries(kpi.map((k) => [k.user, k])), [kpi]);
  const customRoleMap = useMemo(
    () => Object.fromEntries(customRoles.map((r) => [r.code, r.name])),
    [customRoles],
  );

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return q
      ? initial.filter(
          (u) =>
            u.name.toLowerCase().includes(q) ||
            u.title.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q),
        )
      : initial;
  }, [initial, query]);

  // Role stat cards
  const roleCounts = useMemo(
    () =>
      ROLE_OPTIONS.map((r) => ({ ...r, count: initial.filter((u) => u.role === r.code).length })),
    [initial],
  );

  function openCreate() {
    setEditing(null);
    setModal(true);
  }
  function openEdit(u: AdminUserView) {
    setEditing(u);
    setModal(true);
  }

  function lock(u: AdminUserView) {
    startTransition(async () => {
      const res = await toggleUserLock(u.id);
      if (res.ok) {
        toast(
          res.disabled ? t("locked", { name: u.name }) : t("unlocked", { name: u.name }),
          "warning",
        );
        router.refresh();
      }
    });
  }

  function remove(u: AdminUserView) {
    if (!confirm(t("deleteConfirm", { name: u.name }))) return;
    startTransition(async () => {
      const res = await deleteUser(u.id);
      if (res.ok) {
        toast(t("deleted", { name: u.name }), "danger");
        router.refresh();
      } else toast((res as { ok: false; error?: string }).error ?? t("failed"), "danger");
    });
  }

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: tNav("dashboard"), href: "/dashboard" }, { label: t("crumb") }]}
        title={t("title")}
        sub={t("sub", { users: initial.length, roles: ROLE_OPTIONS.length })}
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="input-group" style={{ width: 240 }}>
              <Search className="icon-l" size={14} />
              <input
                className="input"
                placeholder={t("searchPlaceholder")}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            {canEdit && (
              <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={openCreate}>
                {t("newUser")}
              </Button>
            )}
          </div>
        }
      />

      {/* Role stat cards */}
      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 16 }}
      >
        {roleCounts.map((r) => (
          <div
            key={r.code}
            className="card card__pad-sm"
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
            <div
              className="cell-sub"
              style={{
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 700,
              }}
            >
              {r.label.split(" ")[0]}
            </div>
            <div
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 24,
                fontWeight: 800,
                color: "var(--text-primary)",
              }}
            >
              {r.count}
            </div>
          </div>
        ))}
      </div>

      {/* Users table */}
      <Panel flush>
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("thUser")}</th>
                <th>{t("thRole")}</th>
                <th>{t("thDept")}</th>
                <th>{t("thAudits")}</th>
                <th>KPI</th>
                <th>{t("thLastLogin")}</th>
                <th>{t("thStatus")}</th>
                <th className="cell-actions" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    style={{ textAlign: "center", padding: 24, color: "var(--text-tertiary)" }}
                  >
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const k = kpiMap[u.id];
                  return (
                    <tr key={u.id}>
                      <td>
                        <div className="cell-title">
                          <Avatar initials={u.avatar} name={u.name} size="lg" />
                          <div>
                            <div>{u.name}</div>
                            <div className="cell-sub">
                              @{u.id} · {u.title}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                          <span className={`tag ${ROLE_TAG[u.role]}`}>
                            {ROLE_OPTIONS.find((r) => r.code === u.role)?.label ?? u.role}
                          </span>
                          {u.customRoleCode ? (
                            <span className="tag tag--info">
                              {customRoleMap[u.customRoleCode] ?? u.customRoleCode}
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="cell-sub">{u.dept}</td>
                      <td className="tabular text-primary font-semi">{k?.audits ?? 0}</td>
                      <td className="tabular text-primary font-semi">{k?.total ?? "—"}</td>
                      <td className="tabular cell-sub">{fmtLastLogin(u.lastLogin)}</td>
                      <td>
                        {u.disabled ? (
                          <span className="tag tag--danger">
                            <span className="dot" style={{ width: 6, height: 6 }} />
                            Bloklangan
                          </span>
                        ) : (
                          <span className="tag tag--success">
                            <span className="dot" style={{ width: 6, height: 6 }} />
                            Faol
                          </span>
                        )}
                      </td>
                      <td className="cell-actions">
                        {canEdit && (
                          <div style={{ display: "inline-flex", gap: 4, alignItems: "center" }}>
                            <button
                              className="btn btn--ghost btn--xs btn--icon"
                              title={t("edit")}
                              onClick={() => openEdit(u)}
                              disabled={pending}
                            >
                              <Edit3 size={13} />
                            </button>
                            <button
                              className="btn btn--ghost btn--xs btn--icon"
                              title={u.disabled ? t("unlock") : t("lock")}
                              onClick={() => lock(u)}
                              disabled={pending}
                            >
                              {u.disabled ? <LockOpen size={13} /> : <Lock size={13} />}
                            </button>
                            <button
                              className="btn btn--ghost btn--xs btn--icon btn--danger-hover"
                              title={t("delete")}
                              onClick={() => remove(u)}
                              disabled={pending}
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      <UserFormModal
        key={editing?.id ?? "new"}
        open={modalOpen}
        onClose={() => {
          setModal(false);
          router.refresh();
        }}
        user={editing}
        customRoles={customRoles}
      />
    </div>
  );
}
