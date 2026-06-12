"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Download, FileIcon } from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { useToast } from "@/components/ui/Toast";
import { reviewAppeal } from "@/lib/actions/appeals";
import type { Appeal, AppealStatus } from "@/lib/types/entities";
import type { User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

const STATUS_COLORS: Record<AppealStatus, string> = {
  new: "var(--color-info)",
  reviewing: "var(--color-warning, #f59e0b)",
  accepted: "var(--color-success, #22c55e)",
  rejected: "var(--color-danger)",
};

const PRIORITY_COLORS: Record<string, string> = {
  past: "var(--text-secondary)",
  orta: "var(--color-warning, #f59e0b)",
  yuqori: "var(--color-danger)",
};

function fmtBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export interface AppealDrawerProps {
  appeal: Appeal | null;
  usersById: Record<string, User>;
  role: RoleCode;
  onClose: () => void;
}

export function AppealDrawer({ appeal, usersById, role, onClose }: AppealDrawerProps) {
  const t = useTranslations("appeals");
  const toast = useToast();
  const [pending, startTransition] = useTransition();
  const [comment, setComment] = useState("");

  if (!appeal) return <Drawer open={false} onClose={onClose} />;

  const submitter = usersById[appeal.submittedById] ?? { name: appeal.submittedById };
  const isTerminal = appeal.status === "accepted" || appeal.status === "rejected";
  const canReview = role === "super" && !isTerminal;

  function doReview(status: "reviewing" | "accepted" | "rejected") {
    startTransition(async () => {
      const res = await reviewAppeal({ id: appeal!.id, status, comment });
      if (res.ok) {
        toast(t("done"), "success");
        if (status !== "reviewing") onClose();
      } else {
        toast(t("failed"), "danger");
      }
    });
  }

  const statusColor = STATUS_COLORS[appeal.status];

  return (
    <Drawer
      open
      onClose={onClose}
      wide
      title={
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
                padding: "2px 10px",
                borderRadius: 20,
                fontSize: 11.5,
                fontWeight: 600,
                background: `${statusColor}18`,
                color: statusColor,
                border: `1px solid ${statusColor}40`,
              }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor, flexShrink: 0 }} />
              {t(`status_${appeal.status}` as Parameters<typeof t>[0])}
            </span>
            {appeal.priority && (
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: PRIORITY_COLORS[appeal.priority],
                }}
              >
                {t(`priority_${appeal.priority}` as Parameters<typeof t>[0])}
              </span>
            )}
            <span className="cell-sub font-mono" style={{ fontSize: 11 }}>
              {appeal.createdAt.slice(0, 10)}
            </span>
          </div>
          <div className="panel__t" style={{ fontSize: 15 }}>
            {appeal.title}
          </div>
        </div>
      }
      footer={
        <button type="button" className="btn btn--ghost btn--sm" onClick={onClose}>
          {t("close")}
        </button>
      }
    >
      {/* Meta */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        <div className="field">
          <span className="field__label">{t("colBy")}</span>
          <div style={{ fontSize: 13.5 }}>{submitter.name}</div>
        </div>
        <div className="field">
          <span className="field__label">{t("colDate")}</span>
          <div className="font-mono" style={{ fontSize: 13.5 }}>{appeal.createdAt.slice(0, 16).replace("T", " ")}</div>
        </div>
      </div>

      {/* Description */}
      <div style={{ marginBottom: 20 }}>
        <div className="field__label" style={{ marginBottom: 6 }}>Tavsif</div>
        <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, fontSize: 13.5, margin: 0 }}>
          {appeal.description}
        </p>
      </div>

      {/* Review comment from super (if any) */}
      {appeal.reviewComment && (
        <div
          style={{
            padding: "12px 16px",
            background: "var(--bg-elevated)",
            borderRadius: 10,
            borderLeft: `3px solid ${statusColor}`,
            marginBottom: 20,
          }}
        >
          <div className="field__label" style={{ marginBottom: 4 }}>
            {t("drawerComment")}
          </div>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--text-primary)" }}>
            {appeal.reviewComment}
          </p>
        </div>
      )}

      {/* Files */}
      <div style={{ marginBottom: 20 }}>
        <div className="field__label" style={{ marginBottom: 8 }}>{t("drawerFiles")} ({appeal.files.length})</div>
        {appeal.files.length === 0 ? (
          <p style={{ fontSize: 13, color: "var(--text-secondary)" }}>{t("noFiles")}</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {appeal.files.map((f) => (
              <a
                key={f.id}
                href={`/api/appeals/${appeal.id}/files/${f.id}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: "var(--bg-elevated)",
                  borderRadius: 8,
                  color: "var(--text-primary)",
                  textDecoration: "none",
                  fontSize: 13,
                  border: "1px solid var(--border-subtle)",
                  transition: "background 0.12s",
                }}
              >
                <FileIcon size={14} style={{ color: "var(--color-accent)", flexShrink: 0 }} />
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {f.filename}
                </span>
                <span style={{ color: "var(--text-secondary)", fontSize: 11.5 }}>
                  {fmtBytes(f.sizeBytes)}
                </span>
                <Download size={12} style={{ color: "var(--text-secondary)", flexShrink: 0 }} />
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Review panel (super only, non-terminal) */}
      {canReview && (
        <div
          style={{
            padding: "16px",
            background: "var(--bg-elevated)",
            borderRadius: 12,
            border: "1px solid var(--border-subtle)",
          }}
        >
          <div className="field__label" style={{ marginBottom: 10 }}>{t("drawerReview")}</div>
          <textarea
            className="input"
            rows={3}
            placeholder={t("drawerCommentPlaceholder")}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            style={{ width: "100%", resize: "vertical", marginBottom: 12 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            {appeal.status === "new" && (
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                disabled={pending}
                onClick={() => doReview("reviewing")}
              >
                {t("setReviewing")}
              </button>
            )}
            <button
              type="button"
              className="btn btn--primary btn--sm"
              disabled={pending}
              onClick={() => doReview("accepted")}
              style={{ background: "var(--color-success, #22c55e)", borderColor: "var(--color-success, #22c55e)" }}
            >
              {t("accept")}
            </button>
            <button
              type="button"
              className="btn btn--danger btn--sm"
              disabled={pending}
              onClick={() => doReview("rejected")}
            >
              {t("reject")}
            </button>
          </div>
        </div>
      )}
    </Drawer>
  );
}
