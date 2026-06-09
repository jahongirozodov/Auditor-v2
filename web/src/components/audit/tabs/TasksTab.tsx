import Link from "next/link";
import { useTranslations } from "next-intl";
import { Tag, type TagTone } from "@/components/ui/Tag";
import { Avatar } from "@/components/ui/Avatar";
import { TASK_STATUS, tasksByAudit, userById } from "@/lib/fixtures";
import type { Audit, TaskPriority } from "@/lib/types/entities";

const PRIORITY_TONE: Record<TaskPriority, TagTone> = {
  Yuqori: "danger",
  Oʻrta: "warning",
  Past: "ghost",
};

export function TasksTab({ a }: { a: Audit }) {
  const t = useTranslations("auditDetail");
  const tasks = tasksByAudit(a.id);

  return (
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
            {tasks.map((tk) => {
              const u = userById(tk.assignee);
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
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
