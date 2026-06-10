import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  Building2,
  ChevronLeft,
  Mail,
  Plus,
  Server,
  SquarePen,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { Tag } from "@/components/ui/Tag";
import { Progress } from "@/components/ui/Progress";
import { StatusTag } from "@/components/ui/StatusTag";
import { ORG_RISK } from "@/lib/fixtures";
import type { TagTone } from "@/components/ui/Tag";
import type { Audit, Organization, OrgDetail, RiskLevel } from "@/lib/types/entities";

export interface OrgDetailScreenProps {
  org: Organization | undefined;
  det: OrgDetail | undefined;
  orgAudits: Audit[];
}

const RISK_TONE: Record<RiskLevel, TagTone> = { high: "danger", medium: "warning", low: "success" };
const SEV: { key: "critical" | "high" | "medium" | "low"; label: string; color: string }[] = [
  { key: "critical", label: "Critical", color: "var(--status-danger-fg)" },
  { key: "high", label: "High", color: "var(--status-warning-fg)" },
  { key: "medium", label: "Medium", color: "var(--status-info-fg)" },
  { key: "low", label: "Low", color: "var(--text-tertiary)" },
];

function critTone(crit: string): TagTone {
  if (crit === "Kritik") return "danger";
  if (crit === "Yuqori") return "warning";
  return "ghost";
}

export function OrgDetailScreen({ org, det, orgAudits }: OrgDetailScreenProps) {
  const t = useTranslations("orgs");

  if (!org || !det) {
    return (
      <div className="route-anim">
        <PageHeader
          crumbs={[
            { label: "Boshqaruv paneli", href: "/dashboard" },
            { label: t("title"), href: "/organizations" },
          ]}
          title={t("notFound")}
        />
      </div>
    );
  }

  const findings = orgAudits.reduce(
    (s, a) => ({
      critical: s.critical + a.findings.critical,
      high: s.high + a.findings.high,
      medium: s.medium + a.findings.medium,
      low: s.low + a.findings.low,
    }),
    { critical: 0, high: 0, medium: 0, low: 0 },
  );
  const totalFindings = findings.critical + findings.high + findings.medium + findings.low;

  const info: [string, string][] = [
    [t("fSector"), org.sector],
    [t("fRegion"), det.region],
    [t("fAddress"), det.address],
    [t("fHead"), det.head],
    [t("fContact"), org.contact],
    [t("fSince"), det.since],
  ];

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[
          { label: "Boshqaruv paneli", href: "/dashboard" },
          { label: t("title"), href: "/organizations" },
          { label: org.name },
        ]}
        title={org.name}
        sub={`${org.sector} · ${det.region}`}
        actions={
          <>
            <Link href="/organizations" className="btn btn--ghost btn--sm">
              <ChevronLeft size={14} />
              <span>{t("back")}</span>
            </Link>
            <button type="button" className="btn btn--secondary btn--sm">
              <SquarePen size={14} />
              <span>{t("edit")}</span>
            </button>
            <Link href="/audits" className="btn btn--primary btn--sm">
              <Plus size={14} />
              <span>{t("newAudit")}</span>
            </Link>
          </>
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
        <Stat icon={<Building2 size={15} />} label={t("statAudits")} value={org.audits} />
        <Stat icon={<AlertTriangle size={15} />} label={t("totalFindings")} value={totalFindings} />
        <Stat icon={<Server size={15} />} label={t("thDevices")} value={det.devices.length} />
        <Stat icon={<Users size={15} />} label={t("contactsTitle")} value={det.contacts.length} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <section className="panel">
            <div className="panel__h">
              <div className="panel__t">
                <Building2 size={15} />
                <span>{t("infoTitle")}</span>
              </div>
              <Tag tone={RISK_TONE[det.risk]}>{ORG_RISK[det.risk].label}</Tag>
            </div>
            <div className="panel__body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                {info.map(([k, v]) => (
                  <div key={k}>
                    <div className="field__label">{k}</div>
                    <div className="text-primary" style={{ fontSize: 14 }}>
                      {v}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel__h">
              <div className="panel__t">
                <Building2 size={15} />
                <span>{t("auditsTitle")}</span>
              </div>
              <Tag tone="ghost">{orgAudits.length}</Tag>
            </div>
            <div className="panel__body panel__body--flush">
              <div className="tbl-scroll">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>{t("thCode")}</th>
                      <th>{t("thOrg")}</th>
                      <th>{t("thType")}</th>
                      <th>{t("thStatus")}</th>
                      <th>{t("thProgress")}</th>
                      <th>{t("thCritical")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orgAudits.map((a) => {
                      const href = `/audits/${a.id}`;
                      return (
                      <tr key={a.id}>
                        <td className="cell-mono">
                          <Link href={href}>{a.code}</Link>
                        </td>
                        <td>
                          <Link href={href} className="text-primary font-semi">
                            {a.title}
                          </Link>
                        </td>
                        <td>
                          <Tag tone="outline">{a.type}</Tag>
                        </td>
                        <td>
                          <StatusTag status={a.status} />
                        </td>
                        <td style={{ minWidth: 120 }}>
                          <Progress
                            value={a.progress}
                            tone={a.progress > 90 ? "success" : "brand"}
                          />
                        </td>
                        <td>
                          {a.findings.critical > 0 ? (
                            <span className="sev sev--critical">{a.findings.critical}</span>
                          ) : (
                            <span className="cell-sub">—</span>
                          )}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel__h">
              <div className="panel__t">
                <Server size={15} />
                <span>{t("devicesTitle")}</span>
              </div>
              <Tag tone="ghost">{det.devices.length}</Tag>
            </div>
            <div className="panel__body panel__body--flush">
              <div className="tbl-scroll">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>{t("thDevice")}</th>
                      <th>{t("thKind")}</th>
                      <th>{t("thVendor")}</th>
                      <th>{t("thIp")}</th>
                      <th>{t("thCrit")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {det.devices.map((d) => (
                      <tr key={d.name}>
                        <td className="text-primary font-semi">{d.name}</td>
                        <td className="cell-sub">{d.kind}</td>
                        <td className="cell-sub">{d.vendor}</td>
                        <td className="cell-mono">{d.ip}</td>
                        <td>
                          <Tag tone={critTone(d.crit)}>{d.crit}</Tag>
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
                <AlertTriangle size={15} />
                <span>{t("findingsTitle")}</span>
              </div>
            </div>
            <div className="panel__body">
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                <span
                  className="tabular"
                  style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800 }}
                >
                  {totalFindings}
                </span>
                <span className="cell-sub">{t("totalFindings")}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  height: 8,
                  borderRadius: 999,
                  overflow: "hidden",
                  marginBottom: 14,
                  background: "var(--bg-surface-3)",
                }}
              >
                {SEV.map((s) =>
                  findings[s.key] > 0 ? (
                    <div
                      key={s.key}
                      style={{
                        width: `${(findings[s.key] / Math.max(1, totalFindings)) * 100}%`,
                        background: s.color,
                      }}
                    />
                  ) : null,
                )}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {SEV.map((s) => (
                  <div
                    key={s.key}
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
                        style={{ width: 10, height: 10, borderRadius: 3, background: s.color }}
                      />
                      <span>{s.label}</span>
                    </span>
                    <span className="font-mono" style={{ fontWeight: 700 }}>
                      {findings[s.key]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="panel">
            <div className="panel__h">
              <div className="panel__t">
                <Mail size={15} />
                <span>{t("contactsTitle")}</span>
              </div>
            </div>
            <div className="panel__body panel__body--flush">
              {det.contacts.map((c) => (
                <div key={c.email} className="lrow" style={{ border: "none", borderRadius: 0 }}>
                  <span className="avatar">
                    {c.name
                      .split(" ")
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join("")}
                  </span>
                  <div className="lrow__body">
                    <div className="lrow__title">{c.name}</div>
                    <div className="lrow__sub">{c.role}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="cell-sub">{c.email}</div>
                    <div className="cell-sub font-mono">{c.phone}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
