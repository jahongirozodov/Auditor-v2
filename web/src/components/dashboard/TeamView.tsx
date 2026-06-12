import { useTranslations } from "next-intl";
import { PieChart, Users } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Avatar } from "@/components/ui/Avatar";
import { Donut } from "@/components/ui/Donut";
import { Progress } from "@/components/ui/Progress";
import type { Audit, Finding, Task, User } from "@/lib/types/entities";

const SEV_COLOR = {
  critical: "var(--status-danger-fg)",
  high: "var(--color-warning, #f59e0b)",
  medium: "var(--color-info)",
  low: "var(--text-tertiary)",
} as const;

export interface TeamViewProps {
  leadAudits: Audit[];
  teamTasks: Task[];
  teamFindings: Finding[];
  usersById: Record<string, User>;
  userId: string;
}

export function TeamView({
  leadAudits,
  teamTasks,
  teamFindings,
  usersById,
  userId,
}: TeamViewProps) {
  const t = useTranslations("dashboard");

  const memberIds = [
    ...new Set(
      leadAudits.flatMap((a) => a.members).filter((id) => id !== userId),
    ),
  ];

  const memberStats = memberIds.map((memberId) => {
    const memberTasks = teamTasks.filter((tk) => tk.assignee === memberId);
    const done = memberTasks.filter((tk) => tk.status === "done").length;
    const total = memberTasks.length;
    const findingsCount = teamFindings.filter((f) => f.reportedBy === memberId).length;
    return { memberId, done, total, findingsCount };
  });

  const critical = teamFindings.filter((f) => f.severity === "critical").length;
  const high = teamFindings.filter((f) => f.severity === "high").length;
  const medium = teamFindings.filter((f) => f.severity === "medium").length;
  const low = teamFindings.filter((f) => f.severity === "low").length;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
        gap: 16,
        marginTop: 16,
      }}
    >
      <Panel
        icon={<Users size={15} />}
        title={t("panelTeamMembers")}
        flush
      >
        {memberStats.length === 0 ? (
          <p style={{ padding: "var(--space-4)", color: "var(--text-secondary)", fontSize: 13 }}>
            Guruh aʼzolari topilmadi.
          </p>
        ) : (
          <div className="tbl-scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{t("thMember")}</th>
                  <th>{t("thTasksDone")}</th>
                  <th>{t("thTasksTotal")}</th>
                  <th style={{ width: 120 }}>{t("thProgress")}</th>
                  <th>{t("thFindingsCount")}</th>
                </tr>
              </thead>
              <tbody>
                {memberStats.map(({ memberId, done, total, findingsCount }) => {
                  const u = usersById[memberId];
                  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                  return (
                    <tr key={memberId}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <Avatar
                            initials={u?.avatar ?? "?"}
                            name={u?.name ?? memberId}
                          />
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>
                              {u?.name ?? memberId}
                            </div>
                            <div className="cell-sub">{u?.title ?? ""}</div>
                          </div>
                        </div>
                      </td>
                      <td className="font-mono" style={{ fontWeight: 700 }}>
                        {done}
                      </td>
                      <td className="font-mono">{total}</td>
                      <td>
                        <Progress value={pct} tone={pct > 90 ? "success" : "brand"} />
                        <div className="cell-sub" style={{ marginTop: 3 }}>
                          {pct}%
                        </div>
                      </td>
                      <td className="font-mono">{findingsCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel icon={<PieChart size={15} />} title={t("teamFindings")}>
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
                  {label}
                </span>
                <span className="font-mono" style={{ fontWeight: 700 }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  );
}
