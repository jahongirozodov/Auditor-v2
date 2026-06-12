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
  accent?: string;
}

export function Kanban({
  columns,
  tasks,
  usersById,
  statusOf,
  href,
  extraMeta,
}: {
  columns: KanbanColumn[];
  tasks: Task[];
  usersById: Record<string, User>;
  statusOf: (t: Task) => string;
  href: (t: Task) => string;
  extraMeta?: (t: Task) => React.ReactNode;
}) {
  return (
    <div className="kanban">
      {columns.map((col) => {
        const items = tasks.filter((t) => statusOf(t) === col.id);
        return (
          <div
            key={col.id}
            className="kanban__col"
            style={col.accent ? { borderTopColor: col.accent, borderTopWidth: 2 } : undefined}
          >
            <div className="kanban__head">
              <span className="kanban__title">
                {col.accent && (
                  <span
                    className="dot-status"
                    style={{ background: col.accent }}
                    aria-hidden="true"
                  />
                )}
                {col.label}
              </span>
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
                    {extraMeta && <div className="k-card__meta">{extraMeta(t)}</div>}
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
