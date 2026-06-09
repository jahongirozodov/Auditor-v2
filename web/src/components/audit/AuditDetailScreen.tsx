"use client";

import { Fragment, useState } from "react";
import { useTranslations } from "next-intl";
import {
  AlertTriangle,
  CheckSquare,
  Check,
  Download,
  FileText,
  Folder,
  History,
  KeyRound,
  LayoutDashboard,
  Map,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { orgById, WORKFLOW } from "@/lib/fixtures";
import type { ApprovalView } from "@/lib/data/approval";
import type { Audit, KpiUser, User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";
import { Overview } from "./tabs/Overview";
import { Group } from "./tabs/Group";
import { Project } from "./tabs/Project";
import { TasksTab } from "./tabs/TasksTab";
import { FindingsTab } from "./tabs/FindingsTab";
import { Files } from "./tabs/Files";
import { Tokens } from "./tabs/Tokens";
import { Kpi } from "./tabs/Kpi";
import { Reports } from "./tabs/Reports";
import { TabSoon } from "./tabs/TabSoon";

export function AuditDetailScreen({
  role,
  audit,
  usersById,
  allUsers,
  projectApproval,
  kpiUsers,
}: {
  role: RoleCode;
  audit: Audit | null;
  usersById: Record<string, User>;
  allUsers: User[];
  projectApproval: ApprovalView | null;
  kpiUsers: KpiUser[];
}) {
  const t = useTranslations("auditDetail");
  const [tab, setTab] = useState("overview");
  const a = audit;

  if (!a) {
    return (
      <div className="route-anim">
        <PageHeader
          crumbs={[
            { label: "Boshqaruv paneli", href: "/dashboard" },
            { label: "Auditlar", href: "/audits" },
          ]}
          title={t("notFound")}
        />
      </div>
    );
  }

  const org = orgById(a.org);
  const findingsCount = a.findings.critical + a.findings.high + a.findings.medium + a.findings.low;

  const tabs = [
    { id: "overview", label: t("tabOverview"), icon: <LayoutDashboard size={15} /> },
    { id: "group", label: t("tabGroup"), icon: <Users size={15} /> },
    { id: "project", label: t("tabProject"), icon: <Map size={15} /> },
    { id: "tasks", label: t("tabTasks"), icon: <CheckSquare size={15} />, count: a.tasks.total },
    {
      id: "findings",
      label: t("tabFindings"),
      icon: <AlertTriangle size={15} />,
      count: findingsCount,
    },
    { id: "files", label: t("tabFiles"), icon: <Folder size={15} /> },
    { id: "tokens", label: t("tabTokens"), icon: <KeyRound size={15} /> },
    { id: "ai", label: t("tabAi"), icon: <Sparkles size={15} /> },
    { id: "kpi", label: t("tabKpi"), icon: <Trophy size={15} /> },
    { id: "reports", label: t("tabReports"), icon: <FileText size={15} /> },
    { id: "log", label: t("tabLog"), icon: <History size={15} /> },
  ];

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[
          { label: "Boshqaruv paneli", href: "/dashboard" },
          { label: "Auditlar", href: "/audits" },
          { label: a.code },
        ]}
        title={a.title}
        sub={`${a.code} · ${org?.name ?? ""} · ${a.startDate} → ${a.endDate}`}
        actions={
          <>
            <button type="button" className="btn btn--ghost btn--sm">
              <Download size={14} />
              <span>{t("export")}</span>
            </button>
            <button type="button" className="btn btn--soft btn--sm">
              <Sparkles size={14} />
              <span>{t("aiReport")}</span>
            </button>
          </>
        }
      />

      <div className="stepper" style={{ marginBottom: 16 }}>
        {WORKFLOW.map((s, i) => (
          <Fragment key={s.n}>
            {i > 0 ? <div className="stepper__sep" /> : null}
            <div
              className={`stepper__node${s.n < a.stage ? " stepper__node--done" : s.n === a.stage ? " stepper__node--current" : ""}`}
            >
              <span className="stepper__num">{s.n < a.stage ? <Check size={12} /> : s.n}</span>
              <span>{s.title}</span>
            </div>
          </Fragment>
        ))}
      </div>

      <Tabs active={tab} onChange={setTab} tabs={tabs} />

      {tab === "overview" ? (
        <Overview a={a} />
      ) : tab === "group" ? (
        <Group a={a} usersById={usersById} allUsers={allUsers} role={role} />
      ) : tab === "project" ? (
        <Project a={a} role={role} approval={projectApproval} />
      ) : tab === "tasks" ? (
        <TasksTab a={a} />
      ) : tab === "findings" ? (
        <FindingsTab a={a} role={role} />
      ) : tab === "files" ? (
        <Files a={a} />
      ) : tab === "tokens" ? (
        <Tokens a={a} />
      ) : tab === "kpi" ? (
        <Kpi a={a} kpiUsers={kpiUsers} usersById={usersById} />
      ) : tab === "reports" ? (
        <Reports a={a} />
      ) : (
        <TabSoon />
      )}
    </div>
  );
}
