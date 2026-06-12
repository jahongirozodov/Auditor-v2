"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Columns3, LayoutList, Plus } from "lucide-react";
import { Tag, type TagTone } from "@/components/ui/Tag";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { Select } from "@/components/ui/Select";
import { Kanban } from "@/components/ui/Kanban";
import { CreateTaskModal } from "@/components/tasks/CreateTaskModal";
import { TASK_STATUS } from "@/lib/fixtures";
import type { Audit, Task, TaskPriority, TaskStatus, User } from "@/lib/types/entities";
import styles from "./TasksTab.module.css";

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
  "review_head",
  "returned",
  "done",
  "blocked",
];

// CSS variable names for each status tone
const TONE_COLOR: Record<string, string> = {
  neutral: "var(--status-neutral-fg)",
  info:    "var(--status-info-fg)",
  warning: "var(--status-warning-fg)",
  danger:  "var(--status-danger-fg)",
  success: "var(--status-success-fg)",
};

// ——— Module-level view store (useSyncExternalStore, avoids setState-in-effect) ———
const STORAGE_KEY = "audit-tasks-view";
type TaskView = "list" | "kanban";
let _viewCache: TaskView | null = null;
const _viewListeners = new Set<() => void>();

function getViewSnapshot(): TaskView {
  if (_viewCache === null) {
    const saved = localStorage.getItem(STORAGE_KEY);
    _viewCache = saved === "kanban" ? "kanban" : "list";
  }
  return _viewCache;
}

function getViewServer(): TaskView {
  return "list";
}

function subscribeView(cb: () => void) {
  _viewListeners.add(cb);
  return () => { _viewListeners.delete(cb); };
}

function persistView(v: TaskView) {
  _viewCache = v;
  localStorage.setItem(STORAGE_KEY, v);
  _viewListeners.forEach((cb) => cb());
}

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
  const view = useSyncExternalStore(subscribeView, getViewSnapshot, getViewServer);

  const userOf = (id: string): User =>
    usersById[id] ?? ({ id, name: id, avatar: "?", title: "", role: "t1", dept: "" } as User);

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

  // Kanban columns — all 8 statuses with color accents
  const kanbanColumns = STATUS_ORDER.map((s) => ({
    id: s,
    label: TASK_STATUS[s].label,
    accent: TONE_COLOR[TASK_STATUS[s].tone] ?? undefined,
  }));

  // Filtered tasks for kanban (status tab ignored — columns replace it)
  const kanbanTasks = tasks.filter(
    (tk) =>
      (assignee === "all" || tk.assignee === assignee) &&
      (!q || tk.title.toLowerCase().includes(q) || tk.id.toLowerCase().includes(q)),
  );

  return (
    <div>
      {/* ——— Filter bar ——— */}
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
        <Select
          value={assignee}
          onChange={setAssignee}
          style={{ width: 200 }}
          options={[
            { value: "all", label: t("allAssignees") },
            ...audit.members.map((id) => ({ value: id, label: userOf(id).name })),
          ]}
        />

        {/* View toggle */}
        <div className={styles.viewToggle} role="group" aria-label={t("viewToggleLabel")}>
          <button
            type="button"
            className={`${styles.viewBtn} ${view === "list" ? styles.viewBtnActive : ""}`}
            onClick={() => persistView("list")}
            aria-label={t("viewList")}
            title={t("viewList")}
            aria-pressed={view === "list"}
          >
            <LayoutList size={14} />
          </button>
          <button
            type="button"
            className={`${styles.viewBtn} ${view === "kanban" ? styles.viewBtnActive : ""}`}
            onClick={() => persistView("kanban")}
            aria-label={t("viewKanban")}
            title={t("viewKanban")}
            aria-pressed={view === "kanban"}
          >
            <Columns3 size={14} />
          </button>
        </div>

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

      {/* ——— Status tabs (list mode only) ——— */}
      {view === "list" && tasks.length > 0 ? (
        <Tabs active={statusTab} onChange={setStatusTab} tabs={tabs} />
      ) : null}

      {/* ——— List view ——— */}
      {view === "list" && (
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
      )}

      {/* ——— Kanban view ——— */}
      {view === "kanban" && (
        kanbanTasks.length === 0 ? (
          <div className="panel">
            <div className="panel__body" style={{ color: "var(--text-tertiary)", fontSize: 13 }}>
              {tasks.length === 0 ? t("emptyTasks") : t("noMatch")}
            </div>
          </div>
        ) : (
          <Kanban
            columns={kanbanColumns}
            tasks={kanbanTasks}
            usersById={usersById}
            statusOf={(tk) => tk.status}
            href={(tk) => `/tasks/${tk.id}`}
            extraMeta={(tk) => <Tag tone="outline">{tk.type}</Tag>}
          />
        )
      )}

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
