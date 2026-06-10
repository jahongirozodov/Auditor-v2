import { requireSession } from "@/lib/session";
import { getAuditById } from "@/lib/data/audits";
import { getProjectApproval } from "@/lib/data/approval";
import { getAuditProject } from "@/lib/data/projects";
import { getUsers, getUsersById } from "@/lib/data/users";
import { getKpiUsers } from "@/lib/data/kpi";
import { getTasksByAudit, getCreatableTaskAudits } from "@/lib/data/tasks";
import { getTokensByAudit } from "@/lib/data/tokens";
import { getReportsByAudit } from "@/lib/data/reports";
import { getAuditEvidence } from "@/lib/data/evidence";
import { getLatestAuditAnalysis } from "@/lib/data/audit-ai";
import { canManageEvidence } from "@/lib/audit-access";
import { requirePermission } from "@/lib/rbac.server";
import { AuditDetailScreen } from "@/components/audit/AuditDetailScreen";

export default async function AuditDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { role, userId } = await requireSession();
  const { id } = await params;
  const [
    audit,
    project,
    projectApproval,
    usersById,
    allUsers,
    kpiUsers,
    tasks,
    creatable,
    evidence,
    canAddEvidence,
    tokens,
    reports,
  ] = await Promise.all([
    getAuditById(id),
    getAuditProject(id),
    getProjectApproval(id),
    getUsersById(),
    getUsers(),
    getKpiUsers(),
    getTasksByAudit(id),
    getCreatableTaskAudits(userId, role),
    getAuditEvidence(id),
    canManageEvidence(id, userId),
    getTokensByAudit(id),
    getReportsByAudit(id),
  ]);
  const [latestAuditAi, canIssueTokens] = await Promise.all([
    getLatestAuditAnalysis(id),
    requirePermission(userId, "agent.token"),
  ]);
  return (
    <AuditDetailScreen
      role={role}
      currentUserId={userId}
      audit={audit ?? null}
      project={project}
      usersById={usersById}
      allUsers={allUsers}
      projectApproval={projectApproval}
      kpiUsers={kpiUsers}
      tasks={tasks}
      canCreateTasks={creatable.some((a) => a.id === id)}
      evidence={evidence}
      canAddEvidence={canAddEvidence}
      tokens={tokens}
      canIssueTokens={canIssueTokens}
      latestAuditAi={latestAuditAi}
      reports={reports}
    />
  );
}
