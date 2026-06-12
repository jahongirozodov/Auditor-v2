"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageSquareMore, Plus, Search } from "lucide-react";
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
  const [tab, setTab] = useState<AppealType>("taklif");
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
    };
  }, [appeals, tab]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return appeals.filter(
      (a) =>
        a.type === tab &&
        (!q || a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q)),
    );
  }, [appeals, tab, search]);

  const openAppeal = appeals.find((a) => a.id === openId) ?? null;

  return (
    <div className="panel">
      <div className="panel__head">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MessageSquareMore size={18} style={{ color: "var(--color-accent)" }} />
          <h1 className="panel__title">{t("title")}</h1>
        </div>
        <button
          type="button"
          className="btn btn--primary btn--sm"
          onClick={() => setCreateOpen(true)}
        >
          <Plus size={14} />
          {t("new")}
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          borderBottom: "1px solid var(--border-subtle)",
          padding: "0 var(--space-4)",
        }}
      >
        {(["taklif", "kamchilik"] as AppealType[]).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => setTab(type)}
            style={{
              padding: "10px 18px",
              background: "none",
              border: "none",
              borderBottom: `2px solid ${tab === type ? "var(--color-accent)" : "transparent"}`,
              color: tab === type ? "var(--color-accent)" : "var(--text-secondary)",
              fontWeight: tab === type ? 600 : 400,
              fontSize: 13.5,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {type === "taklif" ? t("tabTaklif") : t("tabKamchilik")}
            <span
              style={{
                marginLeft: 6,
                background: "var(--bg-elevated)",
                borderRadius: 10,
                padding: "1px 7px",
                fontSize: 11,
                color: "var(--text-secondary)",
              }}
            >
              {appeals.filter((a) => a.type === type).length}
            </span>
          </button>
        ))}
      </div>

      {/* Stats bar */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          padding: "var(--space-3) var(--space-4)",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {(["new", "reviewing", "accepted", "rejected"] as AppealStatus[]).map((s) => (
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
            <span style={{ fontSize: 11, color: "var(--text-secondary)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              {t(`stat${s.charAt(0).toUpperCase()}${s.slice(1)}` as Parameters<typeof t>[0])}
            </span>
          </div>
        ))}
      </div>

      {/* Search */}
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

      {/* Table */}
      <div className="panel__body" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <p style={{ color: "var(--text-secondary)", padding: "var(--space-4)" }}>{t("empty")}</p>
        ) : (
          <table className="table" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: "var(--space-4)" }}>{t("colTitle")}</th>
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
                  style={{
                    cursor: "pointer",
                    borderLeft: `3px solid ${STATUS_COLORS[appeal.status]}`,
                  }}
                  onClick={() => setOpenId(appeal.id)}
                >
                  <td style={{ paddingLeft: "var(--space-4)" }}>
                    <div style={{ fontWeight: 500 }}>{appeal.title}</div>
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
