import { requireSession } from "@/lib/session";
import { getFindings } from "@/lib/data/findings";
import { getAudits } from "@/lib/data/audits";
import { getTasks } from "@/lib/data/tasks";
import { getUsersById } from "@/lib/data/users";
import { getFindingApprovals, getFindingRemediations } from "@/lib/data/approval";
import { FindingsScreen } from "@/components/findings/FindingsScreen";

export default async function FindingsPage() {
  const { userId, role } = await requireSession();
  const [findings, usersById, approvals, remediations, audits, tasks] = await Promise.all([
    getFindings(),
    getUsersById(),
    getFindingApprovals(),
    getFindingRemediations(),
    getAudits(),
    getTasks(),
  ]);
  return (
    <FindingsScreen
      findings={findings}
      usersById={usersById}
      approvals={approvals}
      remediations={remediations}
      audits={audits}
      tasks={tasks}
      userId={userId}
      role={role}
    />
  );
}
