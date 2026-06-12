import { requireSession } from "@/lib/session";
import { getFindingEvidenceMap, getScopedFindings } from "@/lib/data/findings";
import { getScopedAudits } from "@/lib/data/audits";
import { getAssignableTasks } from "@/lib/data/tasks";
import { getUsersById } from "@/lib/data/users";
import { getFindingApprovals, getFindingRemediations } from "@/lib/data/approval";
import { getOrgs } from "@/lib/data/orgs";
import { userHasPermission } from "@/lib/rbac.server";
import { FindingsScreen } from "@/components/findings/FindingsScreen";

export default async function FindingsPage() {
  const { userId, role } = await requireSession();
  const [
    findings,
    usersById,
    approvals,
    remediations,
    audits,
    tasks,
    evidenceByFindingId,
    orgs,
    canCreate,
  ] = await Promise.all([
    getScopedFindings(userId, role),
    getUsersById(),
    getFindingApprovals(),
    getFindingRemediations(),
    getScopedAudits(userId, role),
    getAssignableTasks(userId, role),
    getFindingEvidenceMap(),
    getOrgs(),
    userHasPermission(userId, "finding.create"),
  ]);
  const orgsById = Object.fromEntries(orgs.map((o) => [o.id, o]));
  return (
    <FindingsScreen
      findings={findings}
      usersById={usersById}
      approvals={approvals}
      remediations={remediations}
      audits={audits}
      tasks={tasks}
      evidenceByFindingId={evidenceByFindingId}
      orgsById={orgsById}
      canCreate={canCreate}
      userId={userId}
      role={role}
    />
  );
}
