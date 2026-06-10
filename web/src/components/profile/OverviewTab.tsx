"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import {
  AlertTriangle,
  BarChart3,
  CheckSquare,
  ChevronRight,
  FolderKanban,
  Sparkles,
  ShieldAlert,
  Star,
  Trophy,
  TrendingUp,
  Zap,
} from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { StatusTag } from "@/components/ui/StatusTag";
import { Sev } from "@/components/ui/Sev";
import type { ProfileData } from "@/lib/data/profile";

const TASK_STATES: { key: string; labelKey: string }[] = [
  { key: "new", labelKey: "taskNew" },
  { key: "in_progress", labelKey: "taskInProgress" },
  { key: "review", labelKey: "taskReview" },
  { key: "done", labelKey: "taskDone" },
  { key: "blocked", labelKey: "taskBlocked" },
];

function KpiBlock({
  label,
  value,
  target,
  color,
}: {
  label: string;
  value: number;
  target: number;
  color: string;
}) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span
          className="cell-sub"
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontWeight: 700,
          }}
        >
          {label}
        </span>
        <span
          className="tabular"
          style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600 }}
        >
          {value} / {target}
        </span>
      </div>
      <div
        className="tabular"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: 26,
          fontWeight: 800,
          color: "var(--text-primary)",
          letterSpacing: "-0.02em",
        }}
      >
        {pct}%
      </div>
      <div
        style={{
          height: 6,
          background: "var(--bg-surface-3)",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 3 }} />
      </div>
    </div>
  );
}

export function OverviewTab({ data }: { data: ProfileData }) {
  const t = useTranslations("profile");
  const { kpi, myTasks, myFindings } = data;
  const myAudits = data.myAudits.slice(0, 4);
  const months = t.raw("kpiMonths") as string[];
  const max = kpi.sparkline.length ? Math.max(...kpi.sparkline) : 1;

  const achievements = [
    { icon: <Zap size={18} />, title: t("achFast"), sub: t("achFastSub"), tone: "warning" },
    {
      icon: <ShieldAlert size={18} />,
      title: t("achCritical"),
      sub: t("achCriticalSub"),
      tone: "danger",
    },
    { icon: <Sparkles size={18} />, title: t("achAi"), sub: t("achAiSub"), tone: "info" },
    { icon: <Star size={18} />, title: t("achTop"), sub: t("achTopSub"), tone: "success" },
  ];

  return (
    <div
      className="grid"
      style={{ gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)", gap: 16 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Panel
          title={t("kpiDynamics")}
          icon={<BarChart3 size={15} />}
          actions={
            <span className="tag tag--success">
              <TrendingUp size={11} />
              {t("kpiDelta", { delta: (kpi.delta > 0 ? "+" : "") + kpi.delta })}
            </span>
          }
        >
          {kpi.sparkline.length > 0 && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: 12,
                height: 140,
                padding: "12px 8px",
                marginBottom: 16,
                borderBottom: "1px dashed var(--border-color)",
              }}
            >
              {kpi.sparkline.map((v, i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <div
                    className="tabular"
                    style={{ fontSize: 11, color: "var(--text-tertiary)", fontWeight: 600 }}
                  >
                    {v}
                  </div>
                  <div
                    style={{
                      width: "100%",
                      height: `${(v / max) * 100}%`,
                      background:
                        i === kpi.sparkline.length - 1 ? "var(--brand)" : "var(--brand-soft-hover)",
                      borderRadius: "4px 4px 0 0",
                      minHeight: 8,
                    }}
                  />
                  <div
                    style={{ fontSize: 10, color: "var(--text-tertiary)", letterSpacing: "0.04em" }}
                  >
                    {months[i] ?? "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            <KpiBlock label={t("kpiAudits")} value={kpi.audits} target={8} color="var(--brand)" />
            <KpiBlock
              label={t("kpiTasks")}
              value={kpi.tasks}
              target={40}
              color="var(--status-info-fg)"
            />
            <KpiBlock
              label={t("kpiFindings")}
              value={kpi.findings}
              target={30}
              color="var(--status-warning-fg)"
            />
          </div>
        </Panel>

        <Panel
          title={
            <>
              <span>{t("myAudits")}</span>
              <span className="count">{myAudits.length}</span>
            </>
          }
          icon={<FolderKanban size={15} />}
          actions={
            <Link href="/audits" className="btn btn--ghost btn--xs">
              <span>{t("all")}</span>
              <ChevronRight size={12} />
            </Link>
          }
          flush
        >
          {myAudits.length === 0 ? (
            <div className="empty-state">
              <FolderKanban size={28} />
              <div>{t("auditsEmpty")}</div>
            </div>
          ) : (
            myAudits.map((a, i) => (
              <Link
                key={a.id}
                href={`/audits/${a.id}`}
                style={{
                  padding: "12px 16px",
                  borderBottom: i < myAudits.length - 1 ? "1px solid var(--border-color)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="cell-title"
                    style={{ fontSize: 13, fontWeight: 600, marginBottom: 2 }}
                  >
                    {a.title}
                  </div>
                  <div className="cell-sub font-mono" style={{ fontSize: 11 }}>
                    {a.code} · {a.type}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <StatusTag status={a.status} />
                  <span
                    className="tabular text-secondary"
                    style={{ fontSize: 12, fontWeight: 600, minWidth: 36, textAlign: "right" }}
                  >
                    {a.progress}%
                  </span>
                </div>
              </Link>
            ))
          )}
        </Panel>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Panel title={t("myTasks")} icon={<CheckSquare size={15} />}>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {TASK_STATES.map(({ key, labelKey }) => {
              const n = myTasks.filter((task) => task.status === key).length;
              const w = (n / (myTasks.length || 1)) * 100;
              return (
                <div
                  key={key}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}
                >
                  <span style={{ flex: "0 0 100px", fontSize: 12, color: "var(--text-secondary)" }}>
                    {t(labelKey)}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 6,
                      background: "var(--bg-surface-3)",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${w}%`,
                        height: "100%",
                        background:
                          key === "done"
                            ? "var(--status-success-fg)"
                            : key === "blocked"
                              ? "var(--status-danger-fg)"
                              : "var(--brand)",
                      }}
                    />
                  </div>
                  <span
                    className="tabular text-primary font-semi"
                    style={{ fontSize: 12, minWidth: 22, textAlign: "right" }}
                  >
                    {n}
                  </span>
                </div>
              );
            })}
          </div>
        </Panel>

        <Panel title={t("achievements")} icon={<Trophy size={15} />}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
            {achievements.map((b, i) => (
              <div key={i} className={`achievement achievement--${b.tone}`}>
                {b.icon}
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      lineHeight: 1.3,
                    }}
                  >
                    {b.title}
                  </div>
                  <div
                    style={{
                      fontSize: 10.5,
                      color: "var(--text-tertiary)",
                      lineHeight: 1.3,
                      marginTop: 2,
                    }}
                  >
                    {b.sub}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        {myFindings.length > 0 && (
          <Panel
            title={
              <>
                <span>{t("myFindings")}</span>
                <span className="count">{myFindings.length}</span>
              </>
            }
            icon={<AlertTriangle size={15} />}
            flush
          >
            {myFindings.slice(0, 4).map((f, i, arr) => (
              <div
                key={f.id}
                style={{
                  padding: "10px 16px",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border-color)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <Sev level={f.severity} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: "var(--text-primary)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.title}
                  </div>
                  <div className="cell-sub font-mono" style={{ fontSize: 10.5 }}>
                    {f.id} · {f.date}
                  </div>
                </div>
              </div>
            ))}
          </Panel>
        )}
      </div>
    </div>
  );
}
