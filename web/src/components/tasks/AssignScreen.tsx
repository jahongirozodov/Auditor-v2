"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { BarChart3, Info, Plus, Star } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tag, type TagTone } from "@/components/ui/Tag";
import { Avatar } from "@/components/ui/Avatar";
import { TASK_STATUS } from "@/lib/fixtures";
import { isLead } from "@/lib/tasks-machine";
import { CreateTaskModal } from "./CreateTaskModal";
import type { Audit, Task, TaskPriority, User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

const PRIORITY_TONE: Record<TaskPriority, TagTone> = {
  Yuqori: "danger",
  Oʻrta: "warning",
  Past: "ghost",
};

export interface AssignScreenProps {
  audits: Audit[];
  tasks: Task[];
  usersById: Record<string, User>;
  role: RoleCode;
}

export function AssignScreen({ audits, tasks, usersById, role }: AssignScreenProps) {
  const t = useTranslations("assign");
  // Default to the first audit that has tasks → the table loads populated (and keeps the
  // historical AUD-2026-014 default once flipped to the code-desc DB order).
  const firstWithTasks = audits.find((a) => tasks.some((tk) => tk.auditId === a.id)) ?? audits[0];
  const [auditId, setAuditId] = useState(firstWithTasks?.id ?? "");
  const [createOpen, setCreateOpen] = useState(false);
  const canCreate = isLead(role);

  const pick = (id: string): Pick<User, "id" | "avatar" | "name" | "title"> =>
    usersById[id] ?? { id, avatar: "?", name: id, title: "" };

  const audit = audits.find((a) => a.id === auditId);
  const auditTasks = tasks.filter((tk) => tk.auditId === auditId);
  const members = audit ? audit.members.map((id) => pick(id)) : [];

  const workload: Record<string, number> = {};
  for (const m of members) workload[m.id] = 0;
  for (const tk of auditTasks) workload[tk.assignee] = (workload[tk.assignee] ?? 0) + 1;
  const maxLoad = Math.max(1, ...Object.values(workload));

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
              onClick={() => setCreateOpen(true)}
            >
              <Plus size={14} />
              <span>{t("newTask")}</span>
            </button>
          ) : null
        }
      />

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{t("auditLabel")}</span>
        <select
          className="select"
          value={auditId}
          onChange={(e) => setAuditId(e.target.value)}
          style={{ maxWidth: 420 }}
          aria-label={t("auditLabel")}
        >
          {audits.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} — {a.title}
            </option>
          ))}
        </select>
        <Tag tone="ghost">{t("taskCount", { n: auditTasks.length })}</Tag>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 300px",
          gap: 16,
          alignItems: "start",
        }}
      >
        <div className="tbl-wrap">
          <div className="tbl-scroll">
            <table className="tbl">
              <thead>
                <tr>
                  <th>{t("thId")}</th>
                  <th>{t("thTask")}</th>
                  <th>{t("thType")}</th>
                  <th>{t("thPriority")}</th>
                  <th>{t("thAssignee")}</th>
                  <th>{t("thStatus")}</th>
                  <th>{t("thDue")}</th>
                </tr>
              </thead>
              <tbody>
                {auditTasks.map((tk) => {
                  const u = pick(tk.assignee);
                  const st = TASK_STATUS[tk.status];
                  return (
                    <tr key={tk.id}>
                      <td className="cell-mono">
                        <Link href={`/tasks/${tk.id}`}>{tk.id}</Link>
                      </td>
                      <td className="text-primary font-semi">{tk.title}</td>
                      <td>
                        <Tag tone="outline">{tk.type}</Tag>
                      </td>
                      <td>
                        <Tag tone={PRIORITY_TONE[tk.priority]}>{tk.priority}</Tag>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Avatar initials={u.avatar} name={u.name} />
                          <span className="cell-sub">{u.name}</span>
                        </div>
                      </td>
                      <td>
                        <Tag tone={st.tone}>{st.label}</Tag>
                      </td>
                      <td className="tabular cell-sub">{tk.due}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <section className="panel">
            <div className="panel__h">
              <div className="panel__t">
                <BarChart3 size={15} />
                <span>{t("workloadTitle")}</span>
              </div>
            </div>
            <div
              className="panel__body"
              style={{ display: "flex", flexDirection: "column", gap: 14 }}
            >
              {members.map((u) => {
                const load = workload[u.id] ?? 0;
                const isLeader = u.id === audit?.leader;
                return (
                  <div key={u.id}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <Avatar initials={u.avatar} name={u.name} />
                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          fontWeight: 550,
                          color: "var(--text-primary)",
                        }}
                      >
                        {u.name}
                      </span>
                      {isLeader ? (
                        <Tag tone="brand">
                          <Star size={10} /> {t("leader")}
                        </Tag>
                      ) : null}
                      <span className="tabular font-semi">{load}</span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        borderRadius: 3,
                        background: "var(--bg-surface-3)",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${(load / maxLoad) * 100}%`,
                          height: "100%",
                          background: isLeader ? "var(--brand)" : "var(--status-info-fg)",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="card" style={{ background: "var(--bg-surface-2)" }}>
            <div
              className="card__pad-sm"
              style={{ display: "flex", gap: 10, alignItems: "flex-start" }}
            >
              <Info size={16} style={{ color: "var(--brand)", flexShrink: 0, marginTop: 1 }} />
              <span style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
                {t("note")}
              </span>
            </div>
          </div>
        </div>
      </div>

      {canCreate && createOpen ? (
        <CreateTaskModal
          open
          onClose={() => setCreateOpen(false)}
          audits={audits}
          usersById={usersById}
          defaultAuditId={auditId}
        />
      ) : null}
    </div>
  );
}
