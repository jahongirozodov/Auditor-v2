"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { AppealDrawer } from "./AppealDrawer";
import { CreateAppealModal } from "./CreateAppealModal";
import type { Appeal, AppealStatus, AppealType } from "@/lib/types/entities";
import type { User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

const STATUS_COLORS: Record<AppealStatus, string> = {
  new: "var(--color-info)",
  reviewing: "var(--color-warning, #f59e0b)",
  accepted: "var(--color-success, #22c55e)",
  rejected: "var(--color-danger)",
  completed: "#06b6d4",
};

const PRIORITY_COLORS: Record<string, string> = {
  past: "var(--text-tertiary, var(--text-secondary))",
  orta: "var(--color-warning, #f59e0b)",
  yuqori: "var(--color-danger)",
};

function StatusBadge({ status, t }: { status: AppealStatus; t: ReturnType<typeof useTranslations> }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "2px 9px",
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        background: `${STATUS_COLORS[status]}18`,
        color: STATUS_COLORS[status],
        border: `1px solid ${STATUS_COLORS[status]}40`,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: STATUS_COLORS[status],
          flexShrink: 0,
        }}
      />
      {t(`status_${status}`)}
    </span>
  );
}

function PriorityBadge({ priority, t }: { priority: string; t: ReturnType<typeof useTranslations> }) {
  const color = PRIORITY_COLORS[priority] ?? "var(--text-secondary)";
  return (
    <span style={{ fontSize: 12, fontWeight: 600, color }}>
      {t(`priority_${priority}`)}
    </span>
  );
}

export interface AppealsScreenProps {
  appeals: Appeal[];
  usersById: Record<string, User>;
  userId: string;
  role: RoleCode;
}

export function AppealsScreen({ appeals, usersById, userId, role }: AppealsScreenProps) {
  const t = useTranslations("appeals");
  const [tab, setTab] = useState("taklif");
  const [openId, setOpenId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");

  const stats = useMemo(() => {
    const tabAppeals = appeals.filter((a) => a.type === tab);
    return {
      new: tabAppeals.filter((a) => a.status === "new").length,
      reviewing: tabAppeals.filter((a) => a.status === "reviewing").length,
      accepted: tabAppeals.filter((a) => a.status === "accepted").length,
      rejected: tabAppeals.filter((a) => a.status === "rejected").length,
      completed: tabAppeals.filter((a) => a.status === "completed").length,
    };
  }, [appeals, tab]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return appeals.filter(
      (a) =>
        a.type === (tab as AppealType) &&
        (!q || a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)),
    );
  }, [appeals, tab, search]);

  const openAppeal = appeals.find((a) => a.id === openId) ?? null;

  const tabs = [
    { id: "taklif", label: t("tabTaklif"), count: appeals.filter((a) => a.type === "taklif").length },
    { id: "kamchilik", label: t("tabKamchilik"), count: appeals.filter((a) => a.type === "kamchilik").length },
  ];

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: "Boshqaruv paneli", href: "/dashboard" }, { label: t("title") }]}
        title={t("title")}
        sub={t("sub")}
        actions={
          <button
            type="button"
            className="btn btn--primary btn--sm"
            onClick={() => setCreateOpen(true)}
          >
            <Plus size={14} />
            <span>{t("new")}</span>
          </button>
        }
      />

      <Tabs active={tab} onChange={setTab} tabs={tabs} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
          padding: "var(--space-3) var(--space-4)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {(["new", "reviewing", "accepted", "rejected", "completed"] as AppealStatus[]).map((s) => (
          <div
            key={s}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              padding: "10px 14px",
              background: "var(--bg-elevated)",
              borderRadius: 10,
              borderLeft: `3px solid ${STATUS_COLORS[s]}`,
            }}
          >
            <span style={{ fontSize: 22, fontWeight: 700, color: STATUS_COLORS[s] }}>
              {stats[s]}
            </span>
            <span
              style={{
                fontSize: 11,
                color: "var(--text-secondary)",
                fontWeight: 500,
                textTransform: "uppercase",
                letterSpacing: "0.04em",
              }}
            >
              {t(`stat${s.charAt(0).toUpperCase()}${s.slice(1)}` as Parameters<typeof t>[0])}
            </span>
          </div>
        ))}
      </div>

      <div style={{ padding: "var(--space-3) var(--space-4)" }}>
        <div className="input-group" style={{ maxWidth: 360 }}>
          <Search className="icon-l" size={14} />
          <input
            className="input"
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="tbl-wrap">
        <div className="tbl-scroll">
          {filtered.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", padding: "var(--space-4)" }}>{t("empty")}</p>
          ) : (
            <table className="tbl">
              <thead>
                <tr>
                  <th>{t("colTitle")}</th>
                  {tab === "kamchilik" && <th>{t("colPriority")}</th>}
                  <th>{t("colStatus")}</th>
                  <th>{t("colDate")}</th>
                  <th>{t("colBy")}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((appeal) => (
                  <tr
                    key={appeal.id}
                    style={{ cursor: "pointer" }}
                    onClick={() => setOpenId(appeal.id)}
                  >
                    <td>
                      <div className="cell-title">
                        <div>
                          <div className="font-semi">{appeal.title}</div>
                          <div
                            className="cell-sub"
                            style={{
                              maxWidth: 420,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {appeal.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    {tab === "kamchilik" && (
                      <td>
                        {appeal.priority ? (
                          <PriorityBadge priority={appeal.priority} t={t} />
                        ) : (
                          <span className="cell-sub">—</span>
                        )}
                      </td>
                    )}
                    <td>
                      <StatusBadge status={appeal.status} t={t} />
                    </td>
                    <td className="cell-sub font-mono" style={{ whiteSpace: "nowrap" }}>
                      {appeal.createdAt.slice(0, 10)}
                    </td>
                    <td>
                      <span style={{ fontSize: 13 }}>
                        {usersById[appeal.submittedById]?.name ?? appeal.submittedById}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <AppealDrawer
        appeal={openAppeal}
        usersById={usersById}
        role={role}
        onClose={() => setOpenId(null)}
      />

      <CreateAppealModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
      />
    </div>
  );
}
