import { requireSession } from "@/lib/session";
import { MyTasksScreen } from "@/components/tasks/MyTasksScreen";

export default async function TasksPage() {
  await requireSession();
  return <MyTasksScreen />;
}
