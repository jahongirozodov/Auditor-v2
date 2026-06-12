"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Download, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Drawer } from "@/components/ui/Drawer";
import { DatePicker } from "@/components/ui/DatePicker";
import { Select } from "@/components/ui/Select";
import { fetchAuditLogs } from "@/lib/actions/logs";
import type {
  AuditLogFilters,
  AuditLogPage,
  AuditLogView,
  LogCategory,
  User,
} from "@/lib/types/entities";

function levelTag(level: string): { cls: string; label: string } {
  if (level === "danger") return { cls: "tag--danger", label: "DANGER" };
  if (level === "warn") return { cls: "tag--warning", label: "WARN" };
  return { cls: "tag--ghost", label: "INFO" };
}

function actionTag(action: string): string {
  if (/(approve|create|issue|pass|add)/.test(action)) return "tag--success";
  if (/(fail|return|reject|revoke|delete)/.test(action)) return "tag--danger";
  return "tag--info";
}

function fmtTime(iso: string): string {
  return iso.slice(0, 19).replace("T", " ");
}

function queryString(f: AuditLogFilters): string {
  const p = new URLSearchParams();
  if (f.from) p.set("from", f.from);
  if (f.to) p.set("to", f.to);
  if (f.level) p.set("level", f.level);
  if (f.category && f.category !== "all") p.set("category", f.category);
  if (f.actorId) p.set("actorId", f.actorId);
  if (f.q?.trim()) p.set("q", f.q.trim());
  return p.toString();
}

export function LogsScreen({
  initial,
  isAdmin,
  users,
}: {
  initial: AuditLogPage;
  isAdmin: boolean;
  users: User[];
}) {
  const t = useTranslations("logs");
  const tNav = useTranslations("nav");
  const [pending, startTransition] = useTransition();
  const [filters, setFilters] = useState<AuditLogFilters>({ category: "all" });
  const [page, setPage] = useState<AuditLogPage>(initial);
  const [detail, setDetail] = useState<AuditLogView | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  function run(f: AuditLogFilters, cursor?: string) {
    startTransition(async () => {
      const p = await fetchAuditLogs(f, cursor);
      setPage((prev) => (cursor ? { ...p, rows: [...prev.rows, ...p.rows] } : p));
    });
  }

  function change(patch: Partial<AuditLogFilters>) {
    const next = { ...filters, ...patch };
    setFilters(next);
    run(next);
  }

  function onSearch(q: string) {
    const next = { ...filters, q };
    setFilters(next);
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => run(next), 350);
  }

  const chips: { id: LogCategory; label: string }[] = [
    { id: "all", label: t("chipAll") },
    { id: "auth", label: t("chipAuth") },
    { id: "finding", label: t("chipFinding") },
    { id: "task", label: t("chipTask") },
    { id: "config", label: t("chipConfig") },
    { id: "error", label: t("chipError") },
  ];
  const activeCat = filters.category ?? "all";

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: tNav("dashboard"), href: "/dashboard" }, { label: t("crumb") }]}
        title={t("title")}
        sub={t("sub", { count: page.total })}
        actions={
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="input-group" style={{ width: 240 }}>
              <Search className="icon-l" size={14} />
              <input
                className="input"
                aria-label={t("search")}
                placeholder={t("search")}
                defaultValue=""
                onChange={(e) => onSearch(e.target.value)}
              />
            </div>
            <a className="btn btn--ghost btn--sm" href={`/api/logs/export?${queryString(filters)}`}>
              <Download size={14} />
              <span>{t("export")}</span>
            </a>
          </div>
        }
      />

      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 12,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {chips.map((c) => (
          <button
            key={c.id}
            type="button"
            className={`tag ${activeCat === c.id ? "tag--brand" : "tag--outline"}`}
            onClick={() => change({ category: c.id })}
            style={{ cursor: "pointer" }}
          >
            {c.label} · {page.counts[c.id]}
          </button>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className="cell-sub">{t("dateFrom")}</span>
          <div style={{ width: 160 }}>
            <DatePicker
              value={filters.from ?? ""}
              onChange={(v) => change({ from: v || undefined })}
              max={filters.to || undefined}
            />
          </div>
        </div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className="cell-sub">{t("dateTo")}</span>
          <div style={{ width: 160 }}>
            <DatePicker
              value={filters.to ?? ""}
              onChange={(v) => change({ to: v || undefined })}
              min={filters.from || undefined}
            />
          </div>
        </div>
        <Select
          value={filters.level ?? ""}
          onChange={(v) => change({ level: (v || undefined) as AuditLogFilters["level"] })}
          style={{ width: 180 }}
          options={[
            { value: "", label: t("levelAll") },
            { value: "info", label: t("levelInfo") },
            { value: "warn", label: t("levelWarn") },
            { value: "danger", label: t("levelDanger") },
          ]}
        />
        {isAdmin && (
          <Select
            value={filters.actorId ?? ""}
            onChange={(v) => change({ actorId: v || undefined })}
            style={{ width: 220 }}
            options={[
              { value: "", label: t("actorAll") },
              ...users.map((u) => ({ value: u.id, label: u.name })),
            ]}
          />
        )}
      </div>

      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("colTime")}</th>
                <th>{t("colLevel")}</th>
                <th>{t("colUser")}</th>
                <th>{t("colAction")}</th>
                <th>{t("colEntity")}</th>
                <th>{t("colSource")}</th>
              </tr>
            </thead>
            <tbody>
              {page.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="cell-sub" style={{ textAlign: "center", padding: 24 }}>
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                page.rows.map((l) => {
                  const lvl = levelTag(l.level);
                  return (
                    <tr key={l.id} style={{ cursor: "pointer" }} onClick={() => setDetail(l)}>
                      <td className="tabular font-mono cell-sub">{fmtTime(l.time)}</td>
                      <td>
                        <span className={`tag ${lvl.cls}`}>{lvl.label}</span>
                      </td>
                      <td>
                        <div className="cell-title">
                          <Avatar initials={l.avatar ?? "?"} name={l.userName ?? t("anonymous")} />
                          <div>
                            <div style={{ fontSize: 13 }}>{l.userName ?? t("anonymous")}</div>
                            <div className="cell-sub">{l.userId ? `@${l.userId}` : "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`font-mono tag ${actionTag(l.action)}`}>{l.action}</span>
                      </td>
                      <td className="font-mono cell-sub">{l.entity}</td>
                      <td>
                        <div
                          className="font-mono"
                          style={{ fontSize: 12.5, color: "var(--text-primary)" }}
                        >
                          {l.ip}
                        </div>
                        <div className="cell-sub font-mono">{l.device}</div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
          marginTop: 16,
        }}
      >
        <span className="cell-sub">
          {t("showing", { shown: page.rows.length, total: page.total })}
        </span>
        {page.nextCursor && (
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => run(filters, page.nextCursor!)}
          >
            {t("loadMore")}
          </Button>
        )}
      </div>

      <Drawer open={detail !== null} onClose={() => setDetail(null)} title={t("detailTitle")}>
        {detail && (
          <div style={{ display: "grid", gap: 14 }}>
            <div className="form-grid">
              <div className="field">
                <span className="field__label">{t("colAction")}</span>
                <span className={`font-mono tag ${actionTag(detail.action)}`}>{detail.action}</span>
              </div>
              <div className="field">
                <span className="field__label">{t("colLevel")}</span>
                <span className={`tag ${levelTag(detail.level).cls}`}>
                  {levelTag(detail.level).label}
                </span>
              </div>
              <div className="field">
                <span className="field__label">{t("detailTime")}</span>
                <span className="font-mono cell-sub">{fmtTime(detail.time)}</span>
              </div>
              <div className="field">
                <span className="field__label">{t("colUser")}</span>
                <span>{detail.userName ?? t("anonymous")}</span>
              </div>
              <div className="field">
                <span className="field__label">{t("detailEntity")}</span>
                <span className="font-mono cell-sub">{detail.entity}</span>
              </div>
              <div className="field">
                <span className="field__label">{t("detailSource")}</span>
                <span className="font-mono cell-sub">
                  {detail.ip} · {detail.device}
                </span>
              </div>
            </div>
            <div>
              <div className="field__label" style={{ marginBottom: 6 }}>
                {t("detailPayload")}
              </div>
              {detail.payload ? (
                <pre
                  className="font-mono"
                  style={{
                    fontSize: 12,
                    background: "var(--bg-surface-2)",
                    border: "1px solid var(--border-color)",
                    borderRadius: 8,
                    padding: 12,
                    overflow: "auto",
                    whiteSpace: "pre-wrap",
                  }}
                >
                  {JSON.stringify(detail.payload, null, 2)}
                </pre>
              ) : (
                <p className="cell-sub">{t("noPayload")}</p>
              )}
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
}
