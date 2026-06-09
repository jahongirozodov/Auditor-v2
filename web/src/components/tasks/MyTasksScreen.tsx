"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Kanban } from "@/components/ui/Kanban";
import { TASKS } from "@/lib/fixtures";
import type { Task } from "@/lib/types/entities";

export function MyTasksScreen() {
  const t = useTranslations("tasks");
  const columns = [
    { id: "new", label: t("colNew") },
    { id: "in_progress", label: t("colInProgress") },
    { id: "review", label: t("colReview") },
    { id: "blocked", label: t("colBlocked") },
    { id: "done", label: t("colDone") },
  ];

  return (
    <div className="route-anim">
      <PageHeader
        crumbs={[{ label: "Boshqaruv paneli", href: "/dashboard" }, { label: t("title") }]}
        title={t("title")}
        sub={t("sub")}
        actions={
          <button type="button" className="btn btn--primary btn--sm">
            <Plus size={14} />
            <span>{t("newTask")}</span>
          </button>
        }
      />
      <Kanban
        columns={columns}
        tasks={TASKS}
        statusOf={(task: Task) => task.status}
        href={(task: Task) => `/tasks/${task.id}`}
      />
    </div>
  );
}
