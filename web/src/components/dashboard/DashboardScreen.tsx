import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  CheckSquare,
  ChevronRight,
  Download,
  FolderKanban,
  PieChart,
  Plus,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Stat } from "@/components/ui/Stat";
import { Sev } from "@/components/ui/Sev";
import { Avatar } from "@/components/ui/Avatar";
import { Progress } from "@/components/ui/Progress";
import { Donut } from "@/components/ui/Donut";
import { StatusTag } from "@/components/ui/StatusTag";
import { HeroBand } from "@/components/wow/HeroBand";
import { Podium } from "@/components/wow/Podium";
import type { Audit, Finding, KpiUser, Organization, User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

const SEV_COLOR: Record<"critical" | "high" | "medium" | "low", string> = {
  critical: "var(--status-danger-fg)",
  high: "var(--status-warning-fg)",
  medium: "var(--status-info-fg)",
  low: "var(--text-tertiary)",
};

export interface DashboardScreenProps {
  role: RoleCode;
  name: string;
  audits: Audit[];
  findings: Finding[];
  kpiUsers: KpiUser[];
  orgsById: Record<string, Organization>;
  usersById: Record<string, User>;
}

export function DashboardScreen({
  role,
  name,
  audits,
  findings,
  kpiUsers,
  orgsById,
  usersById,
}: DashboardScreenProps) {
  const t = useTranslations("dashboard");
  const isLeader = role === "super" || role === "head";
  const firstName = name.split(" ")[0] || name;
  const pick = (id: string): User =>
    usersById[id] ?? { id, name: id, role: "t1", title: "", avatar: "?", dept: "" };

  const myAudits = audits.filter((a) => a.status !== "approved" && a.status !== "cancelled");
  const critical = audits.reduce((s, a) => s + a.findings.critical, 0);
  const high = audits.reduce((s, a) => s + a.findings.high, 0);
  const medium = audits.reduce((s, a) => s + a.findings.medium, 0);
  const low = audits.reduce((s, a) => s + a.findings.low, 0);

  const attention = findings
    .filter((f) => f.severity === "critical" || (f.severity === "high" && f.status === "review"))
    .slice(0, 4);

  return (
    <div className="route-anim">
      <PageHeader
        title={t("greeting", { name: firstName })}
        sub={isLeader ? t("subLeader") : t("subMember")}
        actions={
          <>
            <button type="button" className="btn btn--ghost btn--sm">
              <Download size={14} />
              <span>{t("export")}</span>
            </button>
            {isLeader ? (
              <button type="button" className="btn btn--primary btn--sm">
                <Plus size={14} />
                <span>{t("newAudit")}</span>
              </button>
            ) : null}
          </>
        }
      />

      {isLeader ? (
        <HeroBand
          score={Math.round(100 - critical * 1.5 - high * 0.4)}
          eyebrow={t("heroEyebrow")}
          title={t("heroTitle")}
          caption={t("heroCaption")}
          gauge={89}
          gaugeCap={t("gaugeCap")}
          metrics={[
            { label: t("mActiveAudit"), value: myAudits.length },
            { label: t("mCritical"), value: critical, tone: "danger" },
            { label: t("mRemediated"), value: "68%", tone: "good" },
            { label: t("mAvgCvss"), value: "6.4" },
          ]}
        />
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          margin: "20px 0",
        }}
      >
        <Stat
          icon={<FolderKanban size={15} />}
          label={t("statActiveAudits")}
          value={myAudits.length}
          meta="23 yakunlangan"
          delta={12}
          spark={[2, 3, 3, 4, 4, 4]}
        />
        <Stat
          icon={<AlertTriangle size={15} />}
          label={t("statCritical")}
          value={critical}
          meta="Bu hafta +5"
          delta={25}
          deltaNeg
          spark={[3, 4, 6, 7, 9, critical]}
        />
        <Stat
          icon={<CheckSquare size={15} />}
          label={t("statTasks")}
          value="118/142"
          meta="Muddatida 89%"
          delta={4}
          bar={83}
        />
        <Stat
          icon={<Trophy size={15} />}
          label={t("statKpi")}
          value={1483}
          meta="May oyi, 8 mutaxassis"
          delta={18}
          spark={[820, 940, 1080, 1190, 1320, 1483]}
        />
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 16 }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel
            flush
            icon={<FolderKanban size={15} />}
            title={t("panelActiveAudits")}
            actions={
              <Link href="/audits" className="btn btn--ghost btn--xs">
                <span>{t("viewAll")}</span>
                <ChevronRight size={12} />
              </Link>
            }
          >
            <div className="tbl-scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>{t("thAudit")}</th>
                    <th>{t("thOrg")}</th>
                    <th>{t("thStatus")}</th>
                    <th>{t("thLeader")}</th>
                    <th style={{ width: 140 }}>{t("thProgress")}</th>
                    <th>{t("thFindings")}</th>
                  </tr>
                </thead>
                <tbody>
                  {myAudits.slice(0, 5).map((a) => {
                    const leader = pick(a.leader);
                    return (
                      <tr key={a.id}>
                        <td>
                          <div className="cell-title">
                            <span className="icon-box">
                              <ShieldCheck size={14} />
                            </span>
                            <div>
                              <Link href={`/audits/${a.id}`}>{a.title}</Link>
                              <div className="cell-sub font-mono">
                                {a.code} · {a.type}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ whiteSpace: "nowrap" }}>{orgsById[a.org]?.name}</td>
                        <td>
                          <StatusTag status={a.status} />
                        </td>
                        <td>
                          <Avatar initials={leader.avatar} name={leader.name} />
                        </td>
                        <td>
                          <Progress
                            value={a.progress}
                            tone={a.progress > 90 ? "success" : "brand"}
                          />
                          <div className="cell-sub" style={{ marginTop: 4 }}>
                            {a.progress}% · {a.tasks.done}/{a.tasks.total}
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", gap: 6 }}>
                            {a.findings.critical > 0 ? (
                              <span className="sev sev--critical">{a.findings.critical}</span>
                            ) : null}
                            {a.findings.high > 0 ? (
                              <span className="sev sev--high">{a.findings.high}</span>
                            ) : null}
                            {a.findings.medium > 0 ? (
                              <span className="sev sev--medium">{a.findings.medium}</span>
                            ) : null}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Panel>

          <Panel
            icon={<AlertTriangle size={15} style={{ color: "var(--status-danger-fg)" }} />}
            title={t("panelCritical")}
            flush
            actions={
              <Link href="/findings" className="btn btn--ghost btn--xs">
                <span>{t("all")}</span>
                <ChevronRight size={12} />
              </Link>
            }
          >
            {attention.map((f, i) => {
              const reporter = pick(f.reportedBy);
              return (
                <div
                  key={f.id}
                  style={{
                    padding: "12px 16px",
                    borderBottom:
                      i < attention.length - 1 ? "1px solid var(--border-color)" : "none",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <Sev level={f.severity} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                      {f.title}
                    </div>
                    <div className="cell-sub" style={{ display: "flex", gap: 8, marginTop: 2 }}>
                      <span className="font-mono">{f.id}</span>
                      <span>·</span>
                      <span>{f.asset}</span>
                      <span>·</span>
                      <span>CVSS {f.cvss}</span>
                    </div>
                  </div>
                  <Avatar initials={reporter.avatar} name={reporter.name} />
                  <Link
                    href="/findings"
                    className="btn btn--ghost btn--xs btn--icon"
                    aria-label={f.id}
                  >
                    <ChevronRight size={14} />
                  </Link>
                </div>
              );
            })}
          </Panel>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Panel icon={<PieChart size={15} />} title={t("panelSeverity")}>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <Donut
                items={[
                  { value: critical, color: SEV_COLOR.critical },
                  { value: high, color: SEV_COLOR.high },
                  { value: medium, color: SEV_COLOR.medium },
                  { value: low, color: SEV_COLOR.low },
                ]}
              />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                {(
                  [
                    ["Critical", critical, "critical"],
                    ["High", high, "high"],
                    ["Medium", medium, "medium"],
                    ["Low", low, "low"],
                  ] as const
                ).map(([label, value, sev]) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
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
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          background: SEV_COLOR[sev],
                        }}
                      />
                      <span>{label}</span>
                    </span>
                    <span className="font-mono" style={{ fontWeight: 700 }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          <Panel
            icon={<Trophy size={15} />}
            title={t("panelKpi")}
            flush
            actions={
              <Link href="/kpi" className="btn btn--ghost btn--xs">
                <span>{t("all")}</span>
                <ChevronRight size={12} />
              </Link>
            }
          >
            <Podium users={kpiUsers.slice(0, 3)} usersById={usersById} />
          </Panel>
        </div>
      </div>
    </div>
  );
}
