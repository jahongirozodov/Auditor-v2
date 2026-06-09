import { useTranslations } from "next-intl";
import { Avatar } from "@/components/ui/Avatar";
import { Sparkline } from "@/components/ui/Sparkline";
import type { Audit, KpiUser, User } from "@/lib/types/entities";

export function Kpi({
  a,
  kpiUsers,
  usersById,
}: {
  a: Audit;
  kpiUsers: KpiUser[];
  usersById: Record<string, User>;
}) {
  const t = useTranslations("auditDetail");
  const rows = kpiUsers.filter((k) => a.members.includes(k.user));

  return (
    <div className="tbl-wrap">
      <div className="tbl-scroll">
        <table className="tbl">
          <thead>
            <tr>
              <th>{t("thSpecialist")}</th>
              <th>{t("colTasks")}</th>
              <th>{t("colFindings")}</th>
              <th>Trend</th>
              <th>{t("thScore")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((k) => {
              const u = usersById[k.user];
              if (!u) return null;
              return (
                <tr key={k.user}>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Avatar initials={u.avatar} name={u.name} />
                      <div>
                        <div className="text-primary font-semi">{u.name}</div>
                        <div className="cell-sub">{u.title}</div>
                      </div>
                    </div>
                  </td>
                  <td className="tabular">{k.tasks}</td>
                  <td className="tabular">{k.findings}</td>
                  <td>
                    <Sparkline data={k.sparkline} />
                  </td>
                  <td className="tabular font-bold text-primary">{k.total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
