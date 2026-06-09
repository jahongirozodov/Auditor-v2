"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Tag } from "@/components/ui/Tag";
import { Progress } from "@/components/ui/Progress";
import { StatusTag } from "@/components/ui/StatusTag";
import { AvatarStack } from "@/components/ui/AvatarStack";
import { CreateAuditModal } from "./CreateAuditModal";
import { canManage } from "@/lib/rbac";
import type { Audit, AuditStatus, Organization, User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

const GROUPS: Record<string, AuditStatus[]> = {
  active: [
    "planning",
    "group_forming",
    "project_draft",
    "project_pending",
    "assigning",
    "in_progress",
  ],
  review: ["review", "returned"],
  done: ["approved", "completed"],
};

export interface AuditsListScreenProps {
  audits: Audit[];
  orgsById: Record<string, Organization>;
  usersById: Record<string, User>;
  orgs: Organization[];
  eligibleUsers: User[];
  role: RoleCode;
}

export function AuditsListScreen({
  audits,
  orgsById,
  usersById,
  orgs,
  eligibleUsers,
  role,
}: AuditsListScreenProps) {
  const t = useTranslations("audits");
  const [tab, setTab] = useState("all");
  const [creating, setCreating] = useState(false);
  const canCreate = canManage(role, "audit");

  const inGroup = (status: AuditStatus, g: string) => GROUPS[g]?.includes(status);
  const filtered = audits.filter((a) => tab === "all" || inGroup(a.status, tab));

  const tabs = [
    { id: "all", label: t("tabAll"), count: audits.length },
    {
      id: "active",
      label: t("tabActive"),
      count: audits.filter((a) => inGroup(a.status, "active")).length,
    },
    {
      id: "review",
      label: t("tabReview"),
      count: audits.filter((a) => inGroup(a.status, "review")).length,
    },
    {
      id: "done",
      label: t("tabDone"),
      count: audits.filter((a) => inGroup(a.status, "done")).length,
    },
  ];

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: "Boshqaruv paneli", href: "/dashboard" }, { label: t("title") }]}
        title={t("title")}
        sub={t("sub")}
        actions={
          canCreate ? (
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => setCreating(true)}
            >
              <Plus size={14} />
              <span>{t("newAudit")}</span>
            </button>
          ) : null
        }
      />

      <Tabs active={tab} onChange={setTab} tabs={tabs} />

      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("thAudit")}</th>
                <th>{t("thOrg")}</th>
                <th>{t("thType")}</th>
                <th>{t("thStatus")}</th>
                <th>{t("thTeam")}</th>
                <th>{t("thDates")}</th>
                <th style={{ width: 140 }}>{t("thProgress")}</th>
                <th>{t("thFindings")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="cell-title">
                      <div>
                        <Link href={`/audits/${a.id}`} className="text-primary font-semi">
                          {a.title}
                        </Link>
                        <div className="cell-sub font-mono">{a.code}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{orgsById[a.org]?.name}</td>
                  <td>
                    <Tag tone="outline">{a.type}</Tag>
                  </td>
                  <td>
                    <StatusTag status={a.status} />
                  </td>
                  <td>
                    <AvatarStack
                      items={a.members.map((id) => {
                        const u = usersById[id];
                        return { initials: u?.avatar ?? "?", name: u?.name ?? id };
                      })}
                    />
                  </td>
                  <td className="tabular">
                    <div>{a.startDate}</div>
                    <div className="cell-sub">→ {a.endDate}</div>
                  </td>
                  <td>
                    <Progress value={a.progress} tone={a.progress > 90 ? "success" : "brand"} />
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
                      {a.findings.low > 0 ? (
                        <span className="sev sev--low">{a.findings.low}</span>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateAuditModal
        open={creating}
        onClose={() => setCreating(false)}
        orgs={orgs}
        eligibleUsers={eligibleUsers}
      />
    </div>
  );
}
