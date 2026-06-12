import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getTaskByIdScoped, getTaskStatusHistory } from "@/lib/data/tasks";
import { getAuditById } from "@/lib/data/audits";
import { getUsersById } from "@/lib/data/users";
import { getFindingsByTask } from "@/lib/data/findings";
import { TaskDetailScreen } from "@/components/tasks/TaskDetailScreen";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId, role } = await requireSession();
  const { id } = await params;

  const task = await getTaskByIdScoped(id, userId, role);
  if (!task) notFound();

  const [usersById, history, linkedFindings] = await Promise.all([
    getUsersById(),
    getTaskStatusHistory(id),
    getFindingsByTask(id),
  ]);
  const audit = await getAuditById(task.auditId);

  return (
    <TaskDetailScreen
      task={task}
      audit={audit}
      usersById={usersById}
      history={history}
      linkedFindings={linkedFindings}
      userId={userId}
      role={role}
    />
  );
}
