"use client";

import { useTranslations } from "next-intl";
import { Activity, AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import type { AuditLogView } from "@/lib/types/entities";

const TONE: Record<string, { tone: string; icon: React.ReactNode }> = {
  info: { tone: "info", icon: <Info size={13} /> },
  warn: { tone: "warning", icon: <AlertTriangle size={13} /> },
  danger: { tone: "danger", icon: <ShieldAlert size={13} /> },
};

export function ActivityTab({ activity }: { activity: AuditLogView[] }) {
  const t = useTranslations("profile");

  return (
    <Panel title={t("activityTitle")} icon={<Activity size={15} />} flush>
      {activity.length === 0 ? (
        <div className="empty-state">
          <Activity size={28} />
          <div>{t("activityEmpty")}</div>
        </div>
      ) : (
        <div className="profile-tl" style={{ padding: "8px 16px" }}>
          {activity.map((it) => {
            const tone = TONE[it.level] ?? TONE.info;
            return (
              <div key={it.id} className="profile-tl__row">
                <span className={`profile-tl__icon profile-tl__icon--${tone.tone}`}>
                  {tone.icon}
                </span>
                <div className="profile-tl__body">
                  <div
                    style={{
                      display: "flex",
                      alignItems: "baseline",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <span
                      className="font-mono"
                      style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}
                    >
                      {it.action}
                    </span>
                    <span
                      className="tabular"
                      style={{ fontSize: 11, color: "var(--text-tertiary)" }}
                    >
                      {it.time.slice(0, 16).replace("T", " ")}
                    </span>
                  </div>
                  <div className="cell-sub" style={{ fontSize: 11.5, marginTop: 2 }}>
                    {it.entity} · {it.ip} · {it.device}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Panel>
  );
}
