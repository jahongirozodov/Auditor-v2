import { requireSession } from "@/lib/session";
import { getAudits } from "@/lib/data/audits";
import { getFindings } from "@/lib/data/findings";
import { getKpiUsers } from "@/lib/data/kpi";
import { getOrgs } from "@/lib/data/orgs";
import { getUsersById } from "@/lib/data/users";
import { DashboardScreen } from "@/components/dashboard/DashboardScreen";

export default async function DashboardPage() {
  const { role, name } = await requireSession();
  const [audits, findings, kpiUsers, orgs, usersById] = await Promise.all([
    getAudits(),
    getFindings(),
    getKpiUsers(),
    getOrgs(),
    getUsersById(),
  ]);
  const orgsById = Object.fromEntries(orgs.map((o) => [o.id, o]));

  return (
    <DashboardScreen
      role={role}
      name={name}
      audits={audits}
      findings={findings}
      kpiUsers={kpiUsers}
      orgsById={orgsById}
      usersById={usersById}
    />
  );
}
