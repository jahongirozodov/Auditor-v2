"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Tag, type TagTone } from "@/components/ui/Tag";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { TASK_STATUS } from "@/lib/fixtures";
import type { Audit, Task, TaskPriority, TaskStatus, User } from "@/lib/types/entities";

const PRIORITY_TONE: Record<TaskPriority, TagTone> = {
  Yuqori: "danger",
  Oʻrta: "warning",
  Past: "ghost",
};

const STATUS_ORDER: TaskStatus[] = [
  "new",
  "assigned",
  "in_progress",
  "review",
  "returned",
  "done",
  "blocked",
];

export interface TasksTabProps {
  audit: Audit;
  tasks: Task[];
  usersById: Record<string, User>;
  canCreate: boolean;
}

export function TasksTab({ audit, tasks, usersById, canCreate }: TasksTabProps) {
  const t = useTranslations("auditDetail");
  const [statusTab, setStatusTab] = useState("all");
  const [assignee, setAssignee] = useState("all");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const userOf = (id: string): User =>
    usersById[id] ?? ({ id, name: id, avatar: "?", title: "", role: "t1", dept: "" } as User);

  // Status tabs: "all" + each status that actually has tasks (with counts).
  const statusCounts = tasks.reduce<Record<string, number>>((m, tk) => {
    m[tk.status] = (m[tk.status] ?? 0) + 1;
    return m;
  }, {});
  const tabs = [
    { id: "all", label: t("tabAll"), count: tasks.length },
    ...STATUS_ORDER.filter((s) => statusCounts[s]).map((s) => ({
      id: s,
      label: TASK_STATUS[s].label,
      count: statusCounts[s],
    })),
  ];

  const q = query.trim().toLowerCase();
  const filtered = tasks.filter(
    (tk) =>
      (statusTab === "all" || tk.status === statusTab) &&
      (assignee === "all" || tk.assignee === assignee) &&
      (!q || tk.title.toLowerCase().includes(q) || tk.id.toLowerCase().includes(q)),
  );

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 10,
          alignItems: "center",
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <Input
          placeholder={t("searchPlaceholder")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label={t("searchPlaceholder")}
          style={{ maxWidth: 240 }}
        />
        <select
          className="select"
          value={assignee}
          onChange={(e) => setAssignee(e.target.value)}
          aria-label={t("filterAssignee")}
          style={{ maxWidth: 200 }}
        >
          <option value="all">{t("allAssignees")}</option>
          {audit.members.map((id) => (
            <option key={id} value={id}>
              {userOf(id).name}
            </option>
          ))}
        </select>
        {canCreate ? (
          <Button
            size="sm"
            variant="primary"
            icon={<Plus size={14} />}
            onClick={() => setOpen(true)}
            style={{ marginLeft: "auto" }}
          >
            {t("addTask")}
          </Button>
        ) : null}
      </div>

      {tasks.length > 0 ? <Tabs active={statusTab} onChange={setStatusTab} tabs={tabs} /> : null}

      <div className="tbl-wrap">
        <div className="tbl-scroll">
          <table className="tbl">
            <thead>
              <tr>
                <th>{t("thId")}</th>
                <th>{t("thTask")}</th>
                <th>{t("thType")}</th>
                <th>{t("thPriority")}</th>
                <th>{t("thStatus")}</th>
                <th>{t("thAssignee")}</th>
                <th>{t("thDue")}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="cell-sub"
                    style={{ textAlign: "center", padding: "24px 0" }}
                  >
                    {tasks.length === 0 ? t("emptyTasks") : t("noMatch")}
                  </td>
                </tr>
              ) : (
                filtered.map((tk) => {
                  const u = userOf(tk.assignee);
                  const st = TASK_STATUS[tk.status];
                  const href = `/tasks/${tk.id}`;
                  return (
                    <tr key={tk.id}>
                      <td className="cell-mono">
                        <Link href={href}>{tk.id}</Link>
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
                        <Tag tone={st.tone}>{st.label}</Tag>
                      </td>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <Avatar initials={u.avatar} name={u.name} />
                          <span className="cell-sub">{u.name}</span>
                        </div>
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

      {canCreate ? (
        <CreateTaskModal
          open={open}
          onClose={() => setOpen(false)}
          audits={[audit]}
          usersById={usersById}
          defaultAuditId={audit.id}
        />
      ) : null}
    </div>
  );
}
