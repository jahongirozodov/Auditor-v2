import { requireSession } from "@/lib/session";
import { getAudits } from "@/lib/data/audits";
import { getTasks } from "@/lib/data/tasks";
import { getUsersById } from "@/lib/data/users";
import { AssignScreen } from "@/components/tasks/AssignScreen";

export default async function AssignPage() {
  const { role } = await requireSession();
  const [audits, tasks, usersById] = await Promise.all([getAudits(), getTasks(), getUsersById()]);
  return <AssignScreen audits={audits} tasks={tasks} usersById={usersById} role={role} />;
}
