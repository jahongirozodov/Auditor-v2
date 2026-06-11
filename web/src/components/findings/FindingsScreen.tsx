"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { Download, Plus, Search, X } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { FindingsList } from "./FindingsList";
import { FindingDrawer } from "./FindingDrawer";
import { CreateFindingModal } from "./CreateFindingModal";
import type { FindingApprovalView } from "@/lib/data/approval";
import type {
  ApprovalEvent,
  Audit,
  Finding,
  FindingEvidenceView,
  Organization,
  Task,
  User,
} from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

export interface FindingsScreenProps {
  findings: Finding[];
  usersById: Record<string, User>;
  approvals: Record<string, FindingApprovalView>;
  remediations: Record<string, ApprovalEvent[]>;
  evidenceByFindingId: Record<string, FindingEvidenceView[]>;
  audits: Audit[];
  tasks: Task[];
  orgsById: Record<string, Organization>;
  canCreate: boolean;
  userId: string;
  role: RoleCode;
}

export function FindingsScreen({
  findings,
  usersById,
  approvals,
  remediations,
  evidenceByFindingId,
  audits,
  tasks,
  orgsById,
  canCreate,
  userId,
  role,
}: FindingsScreenProps) {
  const t = useTranslations("findings");
  const [tab, setTab] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [auditFilter, setAuditFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [orgFilter, setOrgFilter] = useState("");

  const defaultAuditId =
    audits.find((a) => tasks.some((tk) => tk.auditId === a.id))?.id ?? audits[0]?.id ?? "";

  const auditsById = useMemo(
    () => Object.fromEntries(audits.map((a) => [a.id, a])),
    [audits],
  );

  const reporterOptions = useMemo(() => {
    const ids = [...new Set(findings.map((f) => f.reportedBy))];
    return ids.map((id) => ({ id, name: usersById[id]?.name ?? id }));
  }, [findings, usersById]);

  const hasFilters = search !== "" || auditFilter !== "" || userFilter !== "" || orgFilter !== "";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return findings.filter((f) => {
      const tabMatch =
        tab === "all"
          ? true
          : tab === "critical"
            ? f.severity === "critical"
            : tab === "high"
              ? f.severity === "high"
              : tab === "review"
                ? f.status === "review"
                : f.ai;
      const searchMatch =
        !q ||
        [f.title, f.asset, f.cwe, f.type].some((v) => v.toLowerCase().includes(q));
      const auditMatch = !auditFilter || f.auditId === auditFilter;
      const userMatch = !userFilter || f.reportedBy === userFilter;
      const audit = auditsById[f.auditId];
      const orgMatch = !orgFilter || audit?.org === orgFilter;
      return tabMatch && searchMatch && auditMatch && userMatch && orgMatch;
    });
  }, [findings, tab, search, auditFilter, userFilter, orgFilter, auditsById]);

  const tabs = [
    { id: "all", label: t("tabAll"), count: findings.length },
    {
      id: "critical",
      label: t("tabCritical"),
      count: findings.filter((f) => f.severity === "critical").length,
    },
    {
      id: "high",
      label: t("tabHigh"),
      count: findings.filter((f) => f.severity === "high").length,
    },
    {
      id: "review",
      label: t("tabReview"),
      count: findings.filter((f) => f.status === "review").length,
    },
    { id: "ai", label: t("tabAi"), count: findings.filter((f) => f.ai).length },
  ];

  const selected = findings.find((f) => f.id === openId) ?? null;

  function clearFilters() {
    setSearch("");
    setAuditFilter("");
    setUserFilter("");
    setOrgFilter("");
  }

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: "Boshqaruv paneli", href: "/dashboard" }, { label: t("title") }]}
        title={t("title")}
        sub={t("sub")}
        actions={
          <>
            <button type="button" className="btn btn--ghost btn--sm">
              <Download size={14} />
              <span>{t("export")}</span>
            </button>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => setCreateOpen(true)}
            >
              <Plus size={14} />
              <span>{t("newFinding")}</span>
            </button>
          </>
        }
      />
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <div className="input-group" style={{ width: 240 }}>
          <Search className="icon-l" size={14} />
          <input
            className="input"
            type="search"
            aria-label={t("filterSearch")}
            placeholder={t("filterSearch")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select"
          aria-label={t("filterAudit")}
          style={{ width: 260 }}
          value={auditFilter}
          onChange={(e) => setAuditFilter(e.target.value)}
        >
          <option value="">{t("filterAudit")}: {t("filterAll")}</option>
          {audits.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} — {a.title}
            </option>
          ))}
        </select>
        <select
          className="select"
          aria-label={t("filterUser")}
          style={{ width: 200 }}
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value)}
        >
          <option value="">{t("filterUser")}: {t("filterAll")}</option>
          {reporterOptions.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <select
          className="select"
          aria-label={t("filterOrg")}
          style={{ width: 200 }}
          value={orgFilter}
          onChange={(e) => setOrgFilter(e.target.value)}
        >
          <option value="">{t("filterOrg")}: {t("filterAll")}</option>
          {Object.values(orgsById).map((o) => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
        {hasFilters && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={clearFilters}>
            <X size={14} />
            <span>{t("filterClear")}</span>
          </button>
        )}
      </div>
      <Tabs active={tab} onChange={setTab} tabs={tabs} />
      <FindingsList findings={filtered} usersById={usersById} onOpen={setOpenId} />
      <FindingDrawer
        finding={selected}
        approval={selected ? (approvals[selected.id] ?? null) : null}
        remediation={selected ? (remediations[selected.id] ?? []) : []}
        evidences={selected ? (evidenceByFindingId[selected.id] ?? []) : []}
        tasks={tasks}
        usersById={usersById}
        userId={userId}
        role={role}
        canCreate={canCreate}
        onClose={() => setOpenId(null)}
      />
      {createOpen ? (
        <CreateFindingModal
          open
          onClose={() => setCreateOpen(false)}
          audits={audits}
          tasks={tasks}
          defaultAuditId={defaultAuditId}
        />
      ) : null}
    </div>
  );
}
