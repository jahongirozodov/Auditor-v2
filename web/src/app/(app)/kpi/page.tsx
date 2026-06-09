import { requireSession } from "@/lib/session";
import { getKpiUsers } from "@/lib/data/kpi";
import { getKpiRules } from "@/lib/data/kpi";
import { getUsersById } from "@/lib/data/users";
import { KpiScreen } from "@/components/kpi/KpiScreen";

export default async function KpiPage() {
  const { userId, role } = await requireSession();
  const [kpiUsers, usersById, rules] = await Promise.all([
    getKpiUsers(),
    getUsersById(),
    getKpiRules(),
  ]);

  const canViewAll = ["chief", "lead", "head", "super"].includes(role);
  const displayUsers = canViewAll ? kpiUsers : kpiUsers.filter((k) => k.user === userId);

  return (
    <KpiScreen
      users={kpiUsers}
      displayUsers={displayUsers}
      usersById={usersById}
      rules={rules}
      canViewAll={canViewAll}
    />
  );
}
