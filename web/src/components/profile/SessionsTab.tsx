"use client";

import { useTranslations } from "next-intl";
import { KeyRound, Monitor } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import type { ProfileData } from "@/lib/data/profile";

export function SessionsTab({ data }: { data: ProfileData }) {
  const t = useTranslations("profile");
  const { tokens } = data;
  const last = data.lastLogin ? data.lastLogin.slice(0, 16).replace("T", " ") : t("metaNever");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <Panel title={t("sessionsTitle")} icon={<Monitor size={15} />} flush>
        <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "var(--brand-soft)",
              display: "grid",
              placeItems: "center",
              color: "var(--brand)",
            }}
          >
            <Monitor size={18} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                {data.user.name}
              </span>
              <span className="tag tag--success">
                <span className="dot" style={{ width: 6, height: 6 }} />
                {t("currentSession")}
              </span>
            </div>
            <div className="cell-sub" style={{ fontSize: 11.5, marginTop: 2 }}>
              {t("metaLastLogin")}: {last}
            </div>
          </div>
        </div>
        <div
          className="cell-sub"
          style={{
            padding: "10px 16px",
            borderTop: "1px solid var(--border-color)",
            fontSize: 11.5,
          }}
        >
          {t("sessionsNote")}
        </div>
      </Panel>

      <Panel
        title={
          <>
            <span>{t("tokensTitle")}</span>
            <span className="count">{tokens.length}</span>
          </>
        }
        icon={<KeyRound size={15} />}
        flush
      >
        {tokens.length === 0 ? (
          <div className="empty-state">
            <KeyRound size={28} />
            <div>{t("tokensEmpty")}</div>
          </div>
        ) : (
          tokens.map((tk, i) => (
            <div
              key={tk.id}
              style={{
                padding: "12px 16px",
                borderBottom: i < tokens.length - 1 ? "1px solid var(--border-color)" : "none",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  background: "var(--brand-soft)",
                  display: "grid",
                  placeItems: "center",
                  color: "var(--brand)",
                }}
              >
                <KeyRound size={15} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="font-mono"
                  style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}
                >
                  {tk.id}
                </div>
                <div className="cell-sub" style={{ fontSize: 11 }}>
                  {tk.audit} · {tk.hostname} · {tk.os}
                </div>
              </div>
              <span
                className={`tag ${tk.status === "active" ? "tag--success" : tk.status === "expired" ? "tag--outline" : "tag--danger"}`}
              >
                {tk.status}
              </span>
            </div>
          ))
        )}
      </Panel>
    </div>
  );
}
