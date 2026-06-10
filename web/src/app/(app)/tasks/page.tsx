import { requireSession } from "@/lib/session";
import { getCreatableTaskAudits, getMyTasks } from "@/lib/data/tasks";
import { getUsersById } from "@/lib/data/users";
import { MyTasksScreen } from "@/components/tasks/MyTasksScreen";

export default async function TasksPage() {
  const { userId, role } = await requireSession();
  const [tasks, usersById, creatableAudits] = await Promise.all([
    getMyTasks(userId),
    getUsersById(),
    getCreatableTaskAudits(userId, role),
  ]);
  return (
    <MyTasksScreen
      tasks={tasks}
      usersById={usersById}
      role={role}
      currentUserId={userId}
      creatableAudits={creatableAudits}
    />
  );
}
