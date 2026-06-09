"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Download, Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { FindingsList } from "./FindingsList";
import { FindingDrawer } from "./FindingDrawer";
import { CreateFindingModal } from "./CreateFindingModal";
import type { FindingApprovalView } from "@/lib/data/approval";
import type { ApprovalEvent, Audit, Finding, Task, User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

export interface FindingsScreenProps {
  findings: Finding[];
  usersById: Record<string, User>;
  approvals: Record<string, FindingApprovalView>;
  remediations: Record<string, ApprovalEvent[]>;
  audits: Audit[];
  tasks: Task[];
  userId: string;
  role: RoleCode;
}

export function FindingsScreen({
  findings,
  usersById,
  approvals,
  remediations,
  audits,
  tasks,
  userId,
  role,
}: FindingsScreenProps) {
  const t = useTranslations("findings");
  const [tab, setTab] = useState("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  // Default the modal to an audit that has tasks (so the task picker isn't empty).
  const defaultAuditId =
    audits.find((a) => tasks.some((tk) => tk.auditId === a.id))?.id ?? audits[0]?.id ?? "";

  const filtered = findings.filter((f) =>
    tab === "all"
      ? true
      : tab === "critical"
        ? f.severity === "critical"
        : tab === "high"
          ? f.severity === "high"
          : tab === "review"
            ? f.status === "review"
            : f.ai,
  );

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
      <Tabs active={tab} onChange={setTab} tabs={tabs} />
      <FindingsList findings={filtered} usersById={usersById} onOpen={setOpenId} />
      <FindingDrawer
        finding={selected}
        approval={selected ? (approvals[selected.id] ?? null) : null}
        remediation={selected ? (remediations[selected.id] ?? []) : []}
        tasks={tasks}
        usersById={usersById}
        userId={userId}
        role={role}
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
