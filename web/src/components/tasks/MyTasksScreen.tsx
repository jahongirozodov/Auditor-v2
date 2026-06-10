"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Kanban } from "@/components/ui/Kanban";
import { CreateTaskModal } from "./CreateTaskModal";
import type { Audit, Task, User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

export interface MyTasksScreenProps {
  tasks: Task[];
  usersById: Record<string, User>;
  role: RoleCode;
  currentUserId: string;
  creatableAudits: Audit[];
}

export function MyTasksScreen({
  tasks,
  usersById,
  currentUserId,
  creatableAudits,
}: MyTasksScreenProps) {
  const t = useTranslations("tasks");
  const [createOpen, setCreateOpen] = useState(false);
  const visibleTasks = tasks.filter((task) => task.assignee === currentUserId);
  const canCreate = creatableAudits.length > 0;
  const columns = [
    { id: "new", label: t("colNew") },
    { id: "assigned", label: t("colAssigned") },
    { id: "in_progress", label: t("colInProgress") },
    { id: "review", label: t("colReview") },
    { id: "returned", label: t("colReturned") },
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

      {visibleTasks.length > 0 ? (
        <Kanban
          columns={columns}
          tasks={visibleTasks}
          usersById={usersById}
          statusOf={(task: Task) => task.status}
          href={(task: Task) => `/tasks/${task.id}`}
        />
      ) : (
        <div className="panel">
          <div className="panel__body" style={{ color: "var(--text-tertiary)", fontSize: 13 }}>
            {t("empty")}
          </div>
        </div>
      )}

      {canCreate && createOpen ? (
        <CreateTaskModal
          open
          onClose={() => setCreateOpen(false)}
          audits={creatableAudits}
          usersById={usersById}
          defaultAuditId={creatableAudits[0]?.id ?? ""}
          defaultAssigneeId={currentUserId}
        />
      ) : null}
    </div>
  );
}
