"use client";

import { Trophy, Users, CheckSquare, TrendingDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { Avatar } from "@/components/ui/Avatar";
import { Sparkline } from "@/components/ui/Sparkline";
import type { KpiUser, KpiRule, User } from "@/lib/types/entities";

interface Props {
  users: KpiUser[];
  displayUsers: KpiUser[];
  usersById: Record<string, User>;
  rules: KpiRule[];
  canViewAll: boolean;
}

// Gold/silver/bronze rank medals — semantic award colors with no design-token equivalent.
// eslint-disable-next-line no-restricted-syntax
const MEDAL_COLOR = ["#fbbf24", "#cbd5e1", "#b45309"];

export function KpiScreen({ users, displayUsers, usersById, rules, canViewAll }: Props) {
  const t = useTranslations("kpi");
  const tn = useTranslations("nav");

  const totalBall = users.reduce((s, k) => s + k.total, 0);
  const activeCount = displayUsers.filter((k) => k.total > 0).length;
  const max = users[0]?.total ?? 1;

  // Rank map: position in the full sorted list (already sorted desc from DB).
  const rankOf = Object.fromEntries(users.map((k, i) => [k.user, i + 1]));

  return (
    <div>
      <PageHeader
        crumbs={[{ label: tn("dashboard"), href: "/dashboard" }, { label: t("title") }]}
        title={t("title")}
      />

      {/* Stat row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
          marginBottom: 16,
        }}
      >
        <Stat
          icon={<Trophy size={14} />}
          label={t("statTotal")}
          value={totalBall}
          spark={[820, 940, 1080, 1190, 1320, totalBall]}
        />
        <Stat icon={<Users size={14} />} label={t("statSpecialists")} value={activeCount} />
        <Stat icon={<CheckSquare size={14} />} label={t("statOnTime")} value="—" />
        <Stat icon={<TrendingDown size={14} />} label={t("statReturned")} value="—" deltaNeg />
      </div>

      {/* Two-column body */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)",
          gap: 16,
        }}
      >
        {/* Leaderboard */}
        <div className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <Trophy size={15} />
              <span>{t("leaderboardTitle")}</span>
            </div>
          </div>
          {!canViewAll && (
            <div
              style={{
                padding: "6px 14px",
                fontSize: 12,
                color: "var(--text-secondary)",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              {t("ownOnly")}
            </div>
          )}
          <div className="panel__body panel__body--flush">
            <div className="tbl-scroll">
              <table className="tbl">
                <thead>
                  <tr>
                    <th>{t("thRank")}</th>
                    <th>{t("thSpecialist")}</th>
                    <th>{t("thAudits")}</th>
                    <th>{t("thTasks")}</th>
                    <th>{t("thFindings")}</th>
                    <th>{t("thTrend")}</th>
                    <th>{t("thDelta")}</th>
                    <th>{t("thTotal")}</th>
                  </tr>
                </thead>
                <tbody>
                  {displayUsers.map((k) => {
                    const u = usersById[k.user];
                    if (!u) return null;
                    const rank = rankOf[k.user] ?? 0;
                    const rankColor = rank <= 3 ? MEDAL_COLOR[rank - 1] : "var(--text-tertiary)";
                    return (
                      <tr key={k.user}>
                        <td>
                          <span
                            style={{
                              fontFamily: "var(--font-display)",
                              fontWeight: 800,
                              fontSize: 16,
                              color: rankColor,
                            }}
                          >
                            #{rank}
                          </span>
                        </td>
                        <td>
                          <div className="cell-title">
                            <Avatar initials={u.avatar} name={u.name} size="lg" />
                            <div>
                              <div className="text-primary font-semi">{u.name}</div>
                              <div className="cell-sub">{u.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="tabular">{k.audits}</td>
                        <td className="tabular">{k.tasks}</td>
                        <td className="tabular">{k.findings}</td>
                        <td>
                          <Sparkline data={k.sparkline} w={100} h={28} />
                        </td>
                        <td>
                          <span className={`tag ${k.delta >= 0 ? "tag--success" : "tag--danger"}`}>
                            {k.delta > 0 ? "+" : ""}
                            {k.delta}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div
                              style={{
                                width: 80,
                                height: 4,
                                background: "var(--bg-surface-3)",
                                borderRadius: 2,
                              }}
                            >
                              <div
                                style={{
                                  width: `${Math.round((k.total / max) * 100)}%`,
                                  height: "100%",
                                  background: "var(--brand)",
                                  borderRadius: 2,
                                }}
                              />
                            </div>
                            <span
                              style={{
                                fontFamily: "var(--font-display)",
                                fontWeight: 800,
                                fontSize: 16,
                                color: "var(--text-primary)",
                                minWidth: 40,
                                textAlign: "right",
                              }}
                            >
                              {k.total}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Rules card */}
        <div className="panel">
          <div className="panel__h">
            <div className="panel__t">
              <Trophy size={15} />
              <span>{t("rulesTitle")}</span>
            </div>
          </div>
          <div className="panel__body" style={{ padding: 0, maxHeight: 480, overflowY: "auto" }}>
            {rules.map((r, i) => (
              <div
                key={r.code}
                style={{
                  padding: "8px 14px",
                  borderBottom: i < rules.length - 1 ? "1px solid var(--border-color)" : "none",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <span style={{ flex: 1, fontSize: 12.5, color: "var(--text-secondary)" }}>
                  {r.label}
                </span>
                <span
                  className="font-bold tabular"
                  style={{
                    color: r.points > 0 ? "var(--status-success-fg)" : "var(--status-danger-fg)",
                    fontFamily: "var(--font-display)",
                    fontSize: 13,
                    minWidth: 32,
                    textAlign: "right",
                  }}
                >
                  {r.points > 0 ? "+" : ""}
                  {r.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
