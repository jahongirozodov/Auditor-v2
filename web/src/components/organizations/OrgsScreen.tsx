import Link from "next/link";
import { useTranslations } from "next-intl";
import { Building2, ChevronRight, FolderKanban, Plus, Server, ShieldAlert } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { Tag } from "@/components/ui/Tag";
import { ORG_RISK } from "@/lib/fixtures";
import type { Organization, OrgDetail, RiskLevel } from "@/lib/types/entities";
import type { TagTone } from "@/components/ui/Tag";

const RISK_TONE: Record<RiskLevel, TagTone> = {
  high: "danger",
  medium: "warning",
  low: "success",
};

export interface OrgsScreenProps {
  orgs: Organization[];
  orgDetails: Record<string, OrgDetail>;
  activeAuditCount: number;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function OrgsScreen({ orgs, orgDetails, activeAuditCount }: OrgsScreenProps) {
  const t = useTranslations("orgs");
  const highRisk = orgs.filter((o) => orgDetails[o.id]?.risk === "high").length;
  const devices = orgs.reduce((s, o) => s + (orgDetails[o.id]?.devices.length ?? 0), 0);

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: "Boshqaruv paneli", href: "/dashboard" }, { label: t("title") }]}
        title={t("title")}
        sub={t("sub")}
        actions={
          <button type="button" className="btn btn--primary btn--sm">
            <Plus size={14} />
            <span>{t("add")}</span>
          </button>
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <Stat icon={<Building2 size={15} />} label={t("statOrgs")} value={orgs.length} />
        <Stat icon={<FolderKanban size={15} />} label={t("statAudits")} value={activeAuditCount} />
        <Stat icon={<ShieldAlert size={15} />} label={t("statHighRisk")} value={highRisk} />
        <Stat icon={<Server size={15} />} label={t("statDevices")} value={devices} />
      </div>

      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("thOrg")}</th>
                <th>{t("thStir")}</th>
                <th>{t("thSector")}</th>
                <th>{t("thRegion")}</th>
                <th>{t("thRisk")}</th>
                <th>{t("thDevices")}</th>
                <th>{t("thAudits")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => {
                const det = orgDetails[o.id];
                const risk = det?.risk ?? "low";
                return (
                  <tr key={o.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div
                          className="org-card__logo"
                          style={{ width: 34, height: 34, fontSize: 13 }}
                        >
                          {initials(o.name)}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <Link href={`/organizations/${o.id}`} className="text-primary font-semi">
                            {o.name}
                          </Link>
                          <div className="cell-sub">{o.contact}</div>
                        </div>
                      </div>
                    </td>
                    <td className="cell-mono">{o.stir}</td>
                    <td>
                      <Tag tone="outline">{o.sector}</Tag>
                    </td>
                    <td className="cell-sub">{det?.region}</td>
                    <td>
                      <Tag tone={RISK_TONE[risk]}>{ORG_RISK[risk].label}</Tag>
                    </td>
                    <td className="tabular">{det?.devices.length ?? 0}</td>
                    <td className="tabular text-primary font-semi">{o.audits}</td>
                    <td className="cell-actions">
                      <Link href={`/organizations/${o.id}`} aria-label={`${o.name} — batafsil`}>
                        <ChevronRight size={16} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
