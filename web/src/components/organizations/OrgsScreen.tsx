"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
  Building2,
  ChevronRight,
  Edit3,
  FolderKanban,
  Plus,
  Server,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { Tag } from "@/components/ui/Tag";
import { Button } from "@/components/ui/Button";
import { OrgFormModal, type EditableOrganization } from "./OrgFormModal";
import type { Organization, OrgDetail, Sector } from "@/lib/types/entities";

export interface OrgsScreenProps {
  orgs: Organization[];
  orgDetails: Record<string, OrgDetail>;
  activeAuditCount: number;
  canEdit?: boolean;
  sectors: Sector[];
  canManageSectors?: boolean;
}

function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function OrgsScreen({
  orgs,
  orgDetails,
  activeAuditCount,
  canEdit = true,
  sectors,
  canManageSectors = false,
}: OrgsScreenProps) {
  const t = useTranslations("orgs");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<EditableOrganization | null>(null);
  const devices = orgs.reduce((s, o) => s + (orgDetails[o.id]?.devices.length ?? 0), 0);

  function openCreate() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(org: Organization, detail: OrgDetail) {
    setEditing({ org, detail });
    setModalOpen(true);
  }

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: "Boshqaruv paneli", href: "/dashboard" }, { label: t("title") }]}
        title={t("title")}
        sub={t("sub")}
        actions={
          canEdit ? (
            <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={openCreate}>
              {t("add")}
            </Button>
          ) : null
        }
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          marginBottom: 16,
        }}
      >
        <Stat icon={<Building2 size={15} />} label={t("statOrgs")} value={orgs.length} />
        <Stat icon={<FolderKanban size={15} />} label={t("statAudits")} value={activeAuditCount} />
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
                <th>{t("thDevices")}</th>
                <th>{t("thAudits")}</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {orgs.map((o) => {
                const det = orgDetails[o.id];
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
                    <td className="tabular">{det?.devices.length ?? 0}</td>
                    <td className="tabular text-primary font-semi">{o.audits}</td>
                    <td className="cell-actions">
                      <div
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "flex-end",
                          gap: 4,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {canEdit && det ? (
                          <button
                            type="button"
                            className="iconbtn"
                            aria-label={t("editOrg", { name: o.name })}
                            onClick={() => openEdit(o, det)}
                          >
                            <Edit3 size={15} />
                          </button>
                        ) : null}
                        <Link
                          href={`/organizations/${o.id}`}
                          className="iconbtn"
                          aria-label={`${o.name} — batafsil`}
                        >
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {modalOpen ? (
        <OrgFormModal
          key={editing?.org.id ?? "new"}
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          organization={editing}
          sectors={sectors}
          canManageSectors={canManageSectors}
        />
      ) : null}
    </div>
  );
}
