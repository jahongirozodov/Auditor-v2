import { useTranslations } from "next-intl";
import {
  Activity,
  AlertTriangle,
  Check,
  CheckSquare,
  PieChart,
  Sparkles,
  Users,
} from "lucide-react";
import { Stat } from "@/components/ui/Stat";
import { Donut } from "@/components/ui/Donut";
import { Sev } from "@/components/ui/Sev";
import { StatusTag } from "@/components/ui/StatusTag";
import { Avatar } from "@/components/ui/Avatar";
import { WORKFLOW, findingsByAudit, userById } from "@/lib/fixtures";
import type { Audit, AuditStatus } from "@/lib/types/entities";

const SEV: { key: "critical" | "high" | "medium" | "low"; label: string; color: string }[] = [
  { key: "critical", label: "Critical", color: "var(--status-danger-fg)" },
  { key: "high", label: "High", color: "var(--status-warning-fg)" },
  { key: "medium", label: "Medium", color: "var(--status-info-fg)" },
  { key: "low", label: "Low", color: "var(--text-tertiary)" },
];

function findingStatus(s: string): AuditStatus {
  return s === "approved" ? "approved" : s === "returned" ? "returned" : "review";
}

export function Overview({ a }: { a: Audit }) {
  const t = useTranslations("auditDetail");
  const total = a.findings.critical + a.findings.high + a.findings.medium + a.findings.low;
  const leader = userById(a.leader);
  const critical = findingsByAudit(a.id)
    .filter((f) => f.severity === "critical" || f.severity === "high")
    .slice(0, 5);

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 16 }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
          <Stat
            icon={<CheckSquare size={15} />}
            label={t("statTasks")}
            value={`${a.tasks.done}/${a.tasks.total}`}
            meta={`${a.tasks.blocked} blok`}
            bar={a.progress}
          />
          <Stat
            icon={<AlertTriangle size={15} />}
            label={t("statFindings")}
            value={total}
            meta={`${a.findings.critical} critical`}
          />
          <Stat
            icon={<Users size={15} />}
            label={t("statTeam")}
            value={a.members.length}
            meta={`${t("leader")}: ${leader.name}`}
          />
          <Stat icon={<Activity size={15} />} label={t("statSync")} value={a.lastSync} />
        </div>

        <section className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <Activity size={15} />
              <span>{t("workflowTitle")}</span>
            </div>
            <span className="tag tag--ghost">{t("stageBadge", { n: a.stage })}</span>
          </div>
          <div className="panel__body">
            <div className="timeline">
              {WORKFLOW.map((s) => {
                const done = s.n < a.stage;
                const cur = s.n === a.stage;
                return (
                  <div
                    key={s.n}
                    className={`timeline__item${done ? " timeline__item--done" : cur ? " timeline__item--current" : ""}`}
                  >
                    <div className="timeline__dot">{done ? <Check size={12} /> : s.n}</div>
                    <div className="timeline__body">
                      <div className="timeline__title">
                        {s.title}
                        {cur ? (
                          <span className="tag tag--brand" style={{ marginLeft: 8 }}>
                            {t("currentStage")}
                          </span>
                        ) : null}
                      </div>
                      <div className="timeline__meta">{s.who}</div>
                      <div className="timeline__desc">{s.short}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <AlertTriangle size={15} style={{ color: "var(--status-danger-fg)" }} />
              <span>{t("criticalTitle")}</span>
            </div>
          </div>
          <div className="panel__body panel__body--flush">
            <div className="tbl-scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    <th />
                    <th>{t("thFinding")}</th>
                    <th>{t("thAsset")}</th>
                    <th>{t("thCvss")}</th>
                    <th>{t("thStatus")}</th>
                  </tr>
                </thead>
                <tbody>
                  {critical.map((f) => (
                    <tr key={f.id}>
                      <td>
                        <Sev level={f.severity} />
                      </td>
                      <td className="text-primary font-semi">{f.title}</td>
                      <td className="cell-mono" style={{ fontSize: 12 }}>
                        {f.asset}
                      </td>
                      <td className="tabular font-bold">{f.cvss}</td>
                      <td>
                        <StatusTag status={findingStatus(f.status)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <section className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <PieChart size={15} />
              <span>{t("severityTitle")}</span>
            </div>
          </div>
          <div className="panel__body" style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <Donut items={SEV.map((s) => ({ value: a.findings[s.key], color: s.color }))} />
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
              {SEV.map((s) => (
                <div
                  key={s.key}
                  style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      fontWeight: 500,
                    }}
                  >
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                    <span>{s.label}</span>
                  </span>
                  <span className="font-mono" style={{ fontWeight: 700 }}>
                    {a.findings[s.key]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <Users size={15} />
              <span>{t("groupTitle")}</span>
            </div>
          </div>
          <div className="panel__body panel__body--flush">
            {a.members.map((id) => {
              const u = userById(id);
              const isLead = id === a.leader;
              return (
                <div key={id} className="lrow" style={{ border: "none", borderRadius: 0 }}>
                  <Avatar initials={u.avatar} name={u.name} />
                  <div className="lrow__body">
                    <div className="lrow__title">{u.name}</div>
                    <div className="lrow__sub">{u.title}</div>
                  </div>
                  <span className={`tag ${isLead ? "tag--brand" : "tag--ghost"}`}>
                    {isLead ? t("dutyLead") : t("dutyAuditor")}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        <div className="ai-card">
          <div className="ai-card__inner">
            <div className="ai-card__head">
              <span className="ai-card__icon">
                <Sparkles size={15} />
              </span>
              <span className="ai-card__title">{t("aiTitle")}</span>
            </div>
            <p className="ai-card__body">{t("aiNoData")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
