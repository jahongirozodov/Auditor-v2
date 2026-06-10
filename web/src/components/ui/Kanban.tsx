"use client";

import Link from "next/link";
import { Avatar } from "./Avatar";
import { Tag, type TagTone } from "./Tag";
import type { Task, TaskPriority, User } from "@/lib/types/entities";

const PRIORITY_TONE: Record<TaskPriority, TagTone> = {
  Yuqori: "danger",
  Oʻrta: "warning",
  Past: "ghost",
};

export interface KanbanColumn {
  id: string;
  label: string;
}

/**
 * Status-board over the `.kanban` classes (ported from chrome.jsx). Cards are
 * deep-links (read-first; drag-drop lands with the backend).
 */
export function Kanban({
  columns,
  tasks,
  usersById,
  statusOf,
  href,
}: {
  columns: KanbanColumn[];
  tasks: Task[];
  usersById: Record<string, User>;
  statusOf: (t: Task) => string;
  href: (t: Task) => string;
}) {
  return (
    <div className="kanban">
      {columns.map((col) => {
        const items = tasks.filter((t) => statusOf(t) === col.id);
        return (
          <div key={col.id} className="kanban__col">
            <div className="kanban__head">
              <span className="kanban__title">{col.label}</span>
              <span className="kanban__count">{items.length}</span>
            </div>
            <div className="kanban__list">
              {items.map((t) => {
                const u = usersById[t.assignee] ?? {
                  id: t.assignee,
                  name: t.assignee,
                  role: "t1",
                  title: "",
                  avatar: "?",
                  dept: "",
                };
                return (
                  <Link key={t.id} href={href(t)} className="k-card">
                    <div className="k-card__top">
                      <span className="k-card__id font-mono">{t.id}</span>
                      <Tag tone={PRIORITY_TONE[t.priority]}>{t.priority}</Tag>
                    </div>
                    <div className="k-card__title">{t.title}</div>
                    <div className="k-card__meta">
                      <span className="cell-sub tabular">{t.due}</span>
                      <Avatar initials={u.avatar} name={u.name} />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
