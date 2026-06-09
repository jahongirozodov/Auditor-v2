import { requireSession } from "@/lib/session";
import { getAuditById } from "@/lib/data/audits";
import { getProjectApproval } from "@/lib/data/approval";
import { getUsers, getUsersById } from "@/lib/data/users";
import { getKpiUsers } from "@/lib/data/kpi";
import { AuditDetailScreen } from "@/components/audit/AuditDetailScreen";

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { role } = await requireSession();
  const { id } = await params;
  const [audit, projectApproval, usersById, allUsers, kpiUsers] = await Promise.all([
    getAuditById(id),
    getProjectApproval(id),
    getUsersById(),
    getUsers(),
    getKpiUsers(),
  ]);
  return (
    <AuditDetailScreen
      role={role}
      audit={audit ?? null}
      usersById={usersById}
      allUsers={allUsers}
      projectApproval={projectApproval}
      kpiUsers={kpiUsers}
    />
  );
}
