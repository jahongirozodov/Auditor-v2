import { requireSession } from "@/lib/session";
import { getTaskById, getTaskStatusHistory } from "@/lib/data/tasks";
import { getAuditById } from "@/lib/data/audits";
import { getUsersById } from "@/lib/data/users";
import { getFindingsByTask } from "@/lib/data/findings";
import { TaskDetailScreen } from "@/components/tasks/TaskDetailScreen";

export default async function TaskDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { userId, role } = await requireSession();
  const { id } = await params;

  const [task, usersById, history, linkedFindings] = await Promise.all([
    getTaskById(id),
    getUsersById(),
    getTaskStatusHistory(id),
    getFindingsByTask(id),
  ]);
  const audit = task ? await getAuditById(task.auditId) : undefined;

  return (
    <TaskDetailScreen
      task={task ?? null}
      audit={audit}
      usersById={usersById}
      history={history}
      linkedFindings={linkedFindings}
      userId={userId}
      role={role}
    />
  );
}
