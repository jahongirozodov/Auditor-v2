"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  Activity,
  Copy,
  Download,
  Eye,
  EyeOff,
  History,
  KeyRound,
  ShieldAlert,
  Smartphone,
  Wifi,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { Avatar } from "@/components/ui/Avatar";
import { useToast } from "@/components/ui/Toast";
import type { AuditToken } from "@/lib/types/entities";
import type {
  AgentOverview,
  SyncSessionView,
  TokenUsageView,
  AgentVersionView,
  SyncedFindingView,
} from "@/lib/data/agent";

export interface AgentScreenProps {
  overview: AgentOverview;
  syncs: SyncSessionView[];
  usage: TokenUsageView[];
  version: AgentVersionView | null;
  tokens: AuditToken[];
  usersById: Record<string, { name: string; avatar: string; title: string }>;
  auditCodeById: Record<string, string>;
  syncedFindings: SyncedFindingView[];
}

function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  if (status === "active" || status === "completed")
    return (
      <span className="tag tag--success">
        <span className="dot dot--pulse" style={{ width: 6, height: 6 }} />
        {labels[status] ?? status}
      </span>
    );
  if (status === "revoked" || status === "failed")
    return <span className="tag tag--danger">{labels[status] ?? status}</span>;
  return <span className="tag tag--ghost">{labels[status] ?? status}</span>;
}

export function AgentScreen({
  overview,
  syncs,
  version,
  tokens,
  usersById,
  auditCodeById,
  syncedFindings,
}: AgentScreenProps) {
  const t = useTranslations("agent");
  const tNav = useTranslations("nav");
  const toast = useToast();
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const activeTokens = tokens.filter((x) => x.status === "active");
  const statusLabels = {
    active: t("stActive"),
    expired: t("stExpired"),
    revoked: t("stRevoked"),
    completed: t("statusCompleted"),
    failed: t("statusFailed"),
    open: t("statusOpen"),
  };

  /** Absolute UTC timestamp "YYYY-MM-DD HH:mm" (deterministic — no Date.now in render). */
  function fmt(iso: string | null): string {
    return iso ? iso.slice(0, 16).replace("T", " ") : t("bannerNever");
  }

  function toggleReveal(id: string) {
    setRevealed((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function copyId(id: string) {
    navigator.clipboard?.writeText(id).catch(() => {});
    toast(t("copied"), "success");
  }

  async function downloadExe() {
    // HEAD check — tells us 404 (not published) before triggering a browser download.
    try {
      const check = await fetch("/api/v1/agent/download", { method: "HEAD" });
      if (!check.ok) {
        toast(t("downloadUnavailable"), "danger");
        return;
      }
    } catch {
      toast(t("downloadUnavailable"), "danger");
      return;
    }
    // Let the browser stream the file natively — avoids loading 150 MB into JS heap.
    toast(t("downloadStarted"), "info");
    const a = document.createElement("a");
    a.href = "/api/v1/agent/download";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: tNav("dashboard"), href: "/dashboard" }, { label: t("crumb") }]}
        title={t("title")}
        sub={t("sub", { n: overview.activeTokens })}
        actions={
          <>
            <Button
              size="sm"
              variant="ghost"
              icon={<History size={14} />}
              onClick={() => toast(t("versionsToast", { v: version?.version ?? "—" }), "info")}
            >
              {t("versions")}
            </Button>
            <Button size="sm" variant="primary" icon={<Download size={14} />} onClick={downloadExe}>
              {t("download")}
            </Button>
          </>
        }
      />

      <div
        className="grid"
        style={{ gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 16 }}
      >
        <Stat
          icon={<KeyRound size={15} />}
          label={t("statActive")}
          value={overview.activeTokens}
          meta={t("statActiveMeta")}
        />
        <Stat
          icon={<Smartphone size={15} />}
          label={t("statDevices")}
          value={overview.connectedDevices}
          meta={t("statDevicesMeta")}
        />
        <Stat
          icon={<Activity size={15} />}
          label={t("statSync")}
          value={overview.sync24h}
          meta={t("statSyncMeta")}
        />
        <Stat
          icon={<ShieldAlert size={15} />}
          label={t("statAnomaly")}
          value={overview.anomalies}
          meta={t("statAnomalyMeta")}
        />
      </div>

      {/* Sync status banner */}
      <div
        className="card card__pad-sm"
        style={{
          marginBottom: 16,
          display: "flex",
          gap: 12,
          alignItems: "center",
          background: "var(--bg-surface-2)",
        }}
      >
        <Wifi size={16} style={{ color: "var(--success)", flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: "var(--text-primary)" }}>{t("bannerOnline")}</div>
          <div className="cell-sub">{t("bannerLast", { when: fmt(overview.latestSync) })}</div>
        </div>
      </div>

      {/* Connected agents (read-only) */}
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>
        {t("tokensTitle")}
      </h3>
      <div className="tbl-wrap" style={{ marginBottom: 16 }}>
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("colToken")}</th>
                <th>{t("colAudit")}</th>
                <th>{t("colUser")}</th>
                <th>{t("colDevice")}</th>
                <th>{t("colStatus")}</th>
                <th>{t("colLastUsed")}</th>
              </tr>
            </thead>
            <tbody>
              {activeTokens.length === 0 ? (
                <tr>
                  <td colSpan={6} className="cell-sub" style={{ textAlign: "center", padding: 24 }}>
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                activeTokens.map((tok) => {
                  const u = usersById[tok.user];
                  const shown = revealed.has(tok.id);
                  return (
                    <tr key={tok.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <code className="font-mono" style={{ fontSize: 12 }}>
                            {shown ? tok.id : "••••••••••••"}
                          </code>
                          <button
                            type="button"
                            className="btn btn--ghost btn--xs btn--icon"
                            aria-label={shown ? t("hide") : t("reveal")}
                            onClick={() => toggleReveal(tok.id)}
                          >
                            {shown ? <EyeOff size={12} /> : <Eye size={12} />}
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--xs btn--icon"
                            aria-label={t("copy")}
                            onClick={() => copyId(tok.id)}
                          >
                            <Copy size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="font-mono cell-sub" style={{ fontSize: 12 }}>
                        {auditCodeById[tok.audit] ?? tok.audit}
                      </td>
                      <td>
                        <div className="cell-title">
                          <Avatar initials={u?.avatar ?? "?"} name={u?.name} />
                          <div>
                            <div style={{ fontSize: 13 }}>{u?.name ?? tok.user}</div>
                            <div className="cell-sub">{u?.title ?? ""}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-mono" style={{ fontSize: 12.5 }}>
                          {tok.hostname}
                        </div>
                        <div className="cell-sub">
                          {[tok.os, tok.agent, tok.ip].filter((x) => x && x !== "—").join(" · ") ||
                            "—"}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={tok.status} labels={statusLabels} />
                      </td>
                      <td className="tabular cell-sub">{tok.lastUsed}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="cell-sub" style={{ marginBottom: 24 }}>
        {t("manageNote")} <Link href="/tokens">{tNav("tokens")}</Link>.
      </p>

      {/* Sync history */}
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>
        {t("syncTitle")}
      </h3>
      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("colAudit")}</th>
                <th>{t("colUser")}</th>
                <th>{t("syncFindings")}</th>
                <th>{t("colStatus")}</th>
                <th>{t("colWhen")}</th>
              </tr>
            </thead>
            <tbody>
              {syncs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="cell-sub" style={{ textAlign: "center", padding: 24 }}>
                    {t("syncEmpty")}
                  </td>
                </tr>
              ) : (
                syncs.map((s) => (
                  <tr key={s.id}>
                    <td className="font-mono cell-sub" style={{ fontSize: 12 }}>
                      {auditCodeById[s.auditId] ?? s.auditId}
                    </td>
                    <td style={{ fontSize: 13 }}>{usersById[s.userId]?.name ?? s.userId}</td>
                    <td className="tabular">{s.findingCount}</td>
                    <td>
                      <StatusBadge status={s.status} labels={statusLabels} />
                    </td>
                    <td className="cell-sub">{fmt(s.completedAt ?? s.startedAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Synced findings — findings that arrived from the desktop agent */}
      <h3
        style={{
          fontSize: 14,
          fontWeight: 600,
          margin: "24px 0 8px",
          color: "var(--text-primary)",
        }}
      >
        {t("syncedTitle")}
      </h3>
      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("colSeverity")}</th>
                <th>{t("colTitle")}</th>
                <th>{t("colAudit")}</th>
                <th>{t("colReporter")}</th>
                <th>{t("colStatus")}</th>
                <th>{t("colEvidence")}</th>
                <th>{t("colDate")}</th>
              </tr>
            </thead>
            <tbody>
              {syncedFindings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="cell-sub" style={{ textAlign: "center", padding: 24 }}>
                    {t("syncedEmpty")}
                  </td>
                </tr>
              ) : (
                syncedFindings.map((f) => (
                  <tr key={f.id}>
                    <td>
                      <span className={`sev sev--${f.severity}`}>{f.severity}</span>
                    </td>
                    <td>
                      <Link href="/findings" style={{ fontSize: 13 }}>
                        {f.title}
                      </Link>
                      <div className="cell-sub font-mono" style={{ fontSize: 11 }}>
                        {f.id}
                      </div>
                    </td>
                    <td className="font-mono cell-sub" style={{ fontSize: 12 }}>
                      {auditCodeById[f.auditId] ?? f.auditId}
                    </td>
                    <td style={{ fontSize: 13 }}>
                      {usersById[f.reportedById]?.name ?? f.reportedById}
                    </td>
                    <td>
                      <span className="tag tag--ghost">{f.status}</span>
                    </td>
                    <td className="tabular cell-sub">{f.evidence}</td>
                    <td className="tabular cell-sub">{f.date}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
