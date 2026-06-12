import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getAudits } from "@/lib/data/audits";
import { getAssignableTasks, getCreatableTaskAudits } from "@/lib/data/tasks";
import { getUsersById } from "@/lib/data/users";
import { requirePermission } from "@/lib/rbac.server";
import { AssignScreen } from "@/components/tasks/AssignScreen";

export default async function AssignPage() {
  const { userId, role } = await requireSession();
  if (!(await requirePermission(userId, "task.assign"))) redirect("/dashboard");

  const [audits, tasks, usersById, creatableAudits] = await Promise.all([
    getAudits(),
    getAssignableTasks(userId, role),
    getUsersById(),
    getCreatableTaskAudits(userId, role),
  ]);
  // Audits the user may see here — same scope as the tasks above, so the Audit
  // filter never offers an audit whose tasks aren't on the board.
  const accessibleAudits =
    role === "super" || role === "head" ? audits : audits.filter((a) => a.leader === userId);
  return (
    <AssignScreen
      audits={accessibleAudits}
      tasks={tasks}
      usersById={usersById}
      currentUserId={userId}
      creatableAudits={creatableAudits}
    />
  );
}
