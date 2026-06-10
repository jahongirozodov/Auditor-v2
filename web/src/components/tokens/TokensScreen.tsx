"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Activity,
  Copy,
  Download,
  Eye,
  EyeOff,
  KeyRound,
  Plus,
  RefreshCw,
  ShieldAlert,
  Smartphone,
  X,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Stat } from "@/components/ui/Stat";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { Field } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { issueToken, revokeToken, rotateToken } from "@/lib/actions/tokens";
import type { AuditToken, Audit, User } from "@/lib/types/entities";

const ISSUE_ROLES = new Set(["chief", "lead", "t1"]);

function StatusBadge({ status, labels }: { status: string; labels: Record<string, string> }) {
  if (status === "active")
    return (
      <span className="tag tag--success">
        <span className="dot dot--pulse" style={{ width: 6, height: 6 }} />
        {labels.active}
      </span>
    );
  if (status === "revoked") return <span className="tag tag--danger">{labels.revoked}</span>;
  return <span className="tag tag--ghost">{labels.expired}</span>;
}

export interface TokensScreenProps {
  tokens: AuditToken[];
  usersById: Record<string, { name: string; avatar: string; title: string }>;
  audits: Audit[];
  users: User[];
}

export function TokensScreen({ tokens, usersById, audits, users }: TokensScreenProps) {
  const t = useTranslations("tokens");
  const tNav = useTranslations("nav");
  const toast = useToast();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ kind: "revoke" | "rotate"; id: string } | null>(null);
  const [issueOpen, setIssueOpen] = useState(false);

  const issueUsers = users.filter((u) => ISSUE_ROLES.has(u.role));
  const [auditId, setAuditId] = useState(audits[0]?.id ?? "");
  const [userId, setUserId] = useState(issueUsers[0]?.id ?? "");
  const [expires, setExpires] = useState("");
  const [device, setDevice] = useState("");

  const counts = {
    active: tokens.filter((x) => x.status === "active").length,
    expired: tokens.filter((x) => x.status === "expired").length,
    revoked: tokens.filter((x) => x.status === "revoked").length,
  };
  const auditsWithTokens = new Set(tokens.filter((x) => x.status === "active").map((x) => x.audit))
    .size;
  const statusLabels = { active: t("stActive"), expired: t("stExpired"), revoked: t("stRevoked") };

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

  function submitIssue() {
    if (!auditId || !userId || !expires) return;
    startTransition(async () => {
      const res = await issueToken({ auditId, userId, expires, device });
      if (res.ok) {
        toast(t("created"), "success");
        setIssueOpen(false);
        setDevice("");
        router.refresh();
      } else {
        toast(t("failed"), "danger");
      }
    });
  }

  function runConfirm() {
    if (!confirm) return;
    const { kind, id } = confirm;
    startTransition(async () => {
      const res = kind === "revoke" ? await revokeToken({ id }) : await rotateToken({ id });
      if (res.ok) {
        toast(
          kind === "revoke" ? t("revoked") : t("rotated"),
          kind === "revoke" ? "warning" : "success",
        );
        setConfirm(null);
        router.refresh();
      } else {
        toast(t("failed"), "danger");
      }
    });
  }

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: tNav("dashboard"), href: "/dashboard" }, { label: t("crumb") }]}
        title={t("title")}
        sub={t("sub", counts)}
        actions={
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
              variant="primary"
              icon={<Plus size={14} />}
              onClick={() => setIssueOpen(true)}
            >
              {t("issue")}
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
          value={counts.active}
          meta={t("statActiveMeta", { n: auditsWithTokens })}
        />
        <Stat
          icon={<Smartphone size={15} />}
          label={t("statDevices")}
          value={tokens.length}
          meta={t("statDevicesMeta")}
        />
        <Stat
          icon={<Activity size={15} />}
          label={t("statSync")}
          value={142}
          delta={8}
          meta={t("statSyncMeta")}
        />
        <Stat
          icon={<ShieldAlert size={15} />}
          label={t("statAnomaly")}
          value={0}
          meta={t("statAnomalyMeta")}
        />
      </div>

      <div
        className="card card__pad-sm"
        style={{
          marginBottom: 14,
          display: "flex",
          gap: 12,
          alignItems: "center",
          background: "var(--bg-surface-2)",
        }}
      >
        <KeyRound size={14} style={{ color: "var(--brand)", flexShrink: 0 }} />
        <span className="text-sm" style={{ flex: 1, color: "var(--text-secondary)" }}>
          {t("infoCard")}
        </span>
        <Button
          size="sm"
          variant="primary"
          icon={<Plus size={14} />}
          onClick={() => setIssueOpen(true)}
        >
          {t("issue")}
        </Button>
      </div>

      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("colToken")}</th>
                <th>{t("colAudit")}</th>
                <th>{t("colUser")}</th>
                <th>{t("colDevice")}</th>
                <th>{t("colExpires")}</th>
                <th>{t("colStatus")}</th>
                <th>{t("colLastUsed")}</th>
                <th>{t("colActions")}</th>
              </tr>
            </thead>
            <tbody>
              {tokens.length === 0 ? (
                <tr>
                  <td colSpan={8} className="cell-sub" style={{ textAlign: "center", padding: 24 }}>
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                tokens.map((tok) => {
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
                        {tok.audit}
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
                        <div
                          className="font-mono"
                          style={{ fontSize: 12.5, color: "var(--text-primary)" }}
                        >
                          {tok.hostname}
                        </div>
                        <div className="cell-sub">
                          {[tok.os, tok.agent, tok.ip].filter((x) => x && x !== "—").join(" · ") ||
                            "—"}
                        </div>
                      </td>
                      <td className="tabular cell-sub">{tok.expires}</td>
                      <td>
                        <StatusBadge status={tok.status} labels={statusLabels} />
                      </td>
                      <td className="tabular cell-sub">{tok.lastUsed}</td>
                      <td>
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            type="button"
                            className="btn btn--ghost btn--xs btn--icon"
                            title={t("rotate")}
                            aria-label={t("rotate")}
                            disabled={pending || tok.status !== "active"}
                            onClick={() => setConfirm({ kind: "rotate", id: tok.id })}
                          >
                            <RefreshCw size={13} />
                          </button>
                          <button
                            type="button"
                            className="btn btn--ghost btn--xs btn--icon"
                            title={t("revoke")}
                            aria-label={t("revoke")}
                            disabled={pending || tok.status === "revoked"}
                            onClick={() => setConfirm({ kind: "revoke", id: tok.id })}
                          >
                            <X size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue token */}
      <Modal
        open={issueOpen}
        onClose={() => setIssueOpen(false)}
        wide
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <KeyRound size={16} /> {t("issueTitle")}
          </span>
        }
        footer={
          <>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIssueOpen(false)}
              disabled={pending}
            >
              {t("cancel")}
            </Button>
            <Button
              size="sm"
              variant="primary"
              icon={<Plus size={14} />}
              onClick={submitIssue}
              disabled={pending || !auditId || !userId || !expires}
            >
              {t("create")}
            </Button>
          </>
        }
      >
        <div className="form-grid">
          <Field className="span-2" label={t("fAudit")} htmlFor="tk-audit">
            <select
              id="tk-audit"
              className="select"
              value={auditId}
              onChange={(e) => setAuditId(e.target.value)}
            >
              {audits.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.code} — {a.title}
                </option>
              ))}
            </select>
          </Field>
          <Field className="span-2" label={t("fUser")} htmlFor="tk-user">
            <select
              id="tk-user"
              className="select"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              {issueUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} — {u.title}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t("fExpires")} htmlFor="tk-exp">
            <input
              id="tk-exp"
              type="datetime-local"
              className="input"
              value={expires}
              onChange={(e) => setExpires(e.target.value)}
            />
          </Field>
          <Field label={t("fDevice")} htmlFor="tk-dev" hint={t("deviceHint")}>
            <input
              id="tk-dev"
              className="input font-mono"
              value={device}
              onChange={(e) => setDevice(e.target.value)}
              placeholder="DESKTOP-..."
            />
          </Field>
        </div>
      </Modal>

      {/* Revoke / rotate confirm */}
      <Modal
        open={confirm !== null}
        onClose={() => setConfirm(null)}
        title={confirm?.kind === "rotate" ? t("rotateTitle") : t("revokeTitle")}
        footer={
          <>
            <Button size="sm" variant="ghost" onClick={() => setConfirm(null)} disabled={pending}>
              {t("cancel")}
            </Button>
            <Button
              size="sm"
              variant={confirm?.kind === "revoke" ? "danger" : "primary"}
              onClick={runConfirm}
              disabled={pending}
            >
              {confirm?.kind === "rotate" ? t("rotateConfirm") : t("revokeConfirm")}
            </Button>
          </>
        }
      >
        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
          {confirm?.kind === "rotate"
            ? t("rotateBody")
            : t("revokeBody", { id: confirm?.id ?? "" })}
        </p>
      </Modal>
    </div>
  );
}
