import { requireSession } from "@/lib/session";
import { getFindingEvidenceMap, getFindings } from "@/lib/data/findings";
import { getAudits } from "@/lib/data/audits";
import { getTasks } from "@/lib/data/tasks";
import { getUsersById } from "@/lib/data/users";
import { getFindingApprovals, getFindingRemediations } from "@/lib/data/approval";
import { FindingsScreen } from "@/components/findings/FindingsScreen";

export default async function FindingsPage() {
  const { userId, role } = await requireSession();
  const [findings, usersById, approvals, remediations, audits, tasks, evidenceByFindingId] =
    await Promise.all([
    getFindings(),
    getUsersById(),
    getFindingApprovals(),
    getFindingRemediations(),
    getAudits(),
    getTasks(),
    getFindingEvidenceMap(),
  ]);
  return (
    <FindingsScreen
      findings={findings}
      usersById={usersById}
      approvals={approvals}
      remediations={remediations}
      audits={audits}
      tasks={tasks}
      evidenceByFindingId={evidenceByFindingId}
      userId={userId}
      role={role}
    />
  );
}
