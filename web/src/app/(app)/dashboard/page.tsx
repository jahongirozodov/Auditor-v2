import { requireSession } from "@/lib/session";
import { getAudits } from "@/lib/data/audits";
import { getFindings, getScopedFindings } from "@/lib/data/findings";
import { getKpiUsers } from "@/lib/data/kpi";
import { getOrgs } from "@/lib/data/orgs";
import { getUsersById } from "@/lib/data/users";
import { getMyTasks, getAssignableTasks } from "@/lib/data/tasks";
import { DashboardScreen } from "@/components/dashboard/DashboardScreen";

export default async function DashboardPage() {
  const { userId, role, name } = await requireSession();

  const isGlobal = role === "super" || role === "head" || role === "chief";

  const [audits, orgs, usersById, kpiUsers, allFindings, myTasks, scopedFindings, teamTasks] =
    await Promise.all([
      getAudits(),
      getOrgs(),
      getUsersById(),
      getKpiUsers(),
      isGlobal ? getFindings() : Promise.resolve([]),
      isGlobal ? Promise.resolve([]) : getMyTasks(userId),
      isGlobal ? Promise.resolve([]) : getScopedFindings(userId, role),
      role === "lead" ? getAssignableTasks(userId, role) : Promise.resolve([]),
    ]);

  const orgsById = Object.fromEntries(orgs.map((o) => [o.id, o]));

  return (
    <DashboardScreen
      role={role}
      userId={userId}
      name={name}
      audits={audits}
      findings={allFindings}
      myTasks={myTasks}
      teamTasks={teamTasks}
      scopedFindings={scopedFindings}
      kpiUsers={kpiUsers}
      orgsById={orgsById}
      usersById={usersById}
    />
  );
}
