"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Tag, type TagTone } from "@/components/ui/Tag";
import { Avatar } from "@/components/ui/Avatar";
import { TASK_STATUS } from "@/lib/fixtures";
import { CreateTaskModal } from "./CreateTaskModal";
import type { Audit, Task, TaskPriority, TaskStatus, User } from "@/lib/types/entities";

const PRIORITY_TONE: Record<TaskPriority, TagTone> = {
  Yuqori: "danger",
  Oʻrta: "warning",
  Past: "ghost",
};

const STATUS_KEYS = Object.keys(TASK_STATUS) as TaskStatus[];

export interface AssignScreenProps {
  audits: Audit[];
  tasks: Task[];
  usersById: Record<string, User>;
  currentUserId: string;
  creatableAudits: Audit[];
}

export function AssignScreen({
  audits,
  tasks,
  usersById,
  currentUserId,
  creatableAudits,
}: AssignScreenProps) {
  const t = useTranslations("assign");
  const [search, setSearch] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [auditFilter, setAuditFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const canCreate = creatableAudits.length > 0;

  const pick = (id: string): Pick<User, "id" | "avatar" | "name" | "title"> =>
    usersById[id] ?? { id, avatar: "?", name: id, title: "" };

  const auditsById = useMemo(() => {
    const map: Record<string, Audit> = {};
    for (const a of audits) map[a.id] = a;
    return map;
  }, [audits]);

  // Assignee filter lists only people actually assigned to a visible task.
  const assigneeOptions = useMemo(() => {
    const ids = Array.from(new Set(tasks.map((tk) => tk.assignee)));
    return ids
      .map((id) => pick(id))
      .sort((a, b) => a.name.localeCompare(b.name, "uz"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, usersById]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((tk) => {
      if (assigneeFilter && tk.assignee !== assigneeFilter) return false;
      if (statusFilter && tk.status !== statusFilter) return false;
      if (auditFilter && tk.auditId !== auditFilter) return false;
      if (q && !`${tk.id} ${tk.title}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [tasks, search, assigneeFilter, statusFilter, auditFilter]);

  const createDefaultAuditId = creatableAudits.some((a) => a.id === auditFilter)
    ? auditFilter
    : (creatableAudits[0]?.id ?? "");

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
          gap: 10,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <div className="input-group" style={{ width: 240 }}>
          <Search className="icon-l" size={14} />
          <input
            className="input"
            aria-label={t("search")}
            placeholder={t("search")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="select"
          aria-label={t("filterAssignee")}
          style={{ width: 200 }}
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
        >
          <option value="">{t("assigneeAll")}</option>
          {assigneeOptions.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        <select
          className="select"
          aria-label={t("filterStatus")}
          style={{ width: 180 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">{t("statusAll")}</option>
          {STATUS_KEYS.map((s) => (
            <option key={s} value={s}>
              {TASK_STATUS[s].label}
            </option>
          ))}
        </select>
        <select
          className="select"
          aria-label={t("filterAudit")}
          style={{ width: 280 }}
          value={auditFilter}
          onChange={(e) => setAuditFilter(e.target.value)}
        >
          <option value="">{t("auditAll")}</option>
          {audits.map((a) => (
            <option key={a.id} value={a.id}>
              {a.code} — {a.title}
            </option>
          ))}
        </select>
        <Tag tone="ghost">{t("taskCount", { n: filtered.length })}</Tag>
      </div>

      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("thId")}</th>
                <th>{t("thAudit")}</th>
                <th>{t("thTask")}</th>
                <th>{t("thType")}</th>
                <th>{t("thPriority")}</th>
                <th>{t("thAssignee")}</th>
                <th>{t("thStatus")}</th>
                <th>{t("thDue")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="cell-sub" style={{ textAlign: "center", padding: 24 }}>
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                filtered.map((tk) => {
                  const u = pick(tk.assignee);
                  const st = TASK_STATUS[tk.status];
                  const aud = auditsById[tk.auditId];
                  const href = `/tasks/${tk.id}`;
                  return (
                    <tr key={tk.id}>
                      <td className="cell-mono">
                        <Link href={href}>{tk.id}</Link>
                      </td>
                      <td className="cell-mono cell-sub" title={aud?.title ?? tk.auditId}>
                        {aud?.code ?? tk.auditId}
                      </td>
                      <td>
                        <Link href={href} className="text-primary font-semi">
                          {tk.title}
                        </Link>
                      </td>
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
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {canCreate && createOpen ? (
        <CreateTaskModal
          open
          onClose={() => setCreateOpen(false)}
          audits={creatableAudits}
          usersById={usersById}
          defaultAuditId={createDefaultAuditId}
          defaultAssigneeId={currentUserId}
        />
      ) : null}
    </div>
  );
}
