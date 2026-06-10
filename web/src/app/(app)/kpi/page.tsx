import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { getKpiUsers } from "@/lib/data/kpi";
import { getKpiRules } from "@/lib/data/kpi";
import { getUsersById } from "@/lib/data/users";
import { requireAnyPermission, requirePermission } from "@/lib/rbac.server";
import { KpiScreen } from "@/components/kpi/KpiScreen";

export default async function KpiPage() {
  const { userId } = await requireSession();
  const [kpiUsers, usersById, rules, canViewOwn, canViewAll] = await Promise.all([
    getKpiUsers(),
    getUsersById(),
    getKpiRules(),
    requireAnyPermission(userId, ["kpi.view_own", "kpi.view_all"]),
    requirePermission(userId, "kpi.view_all"),
  ]);

  if (!canViewOwn) redirect("/dashboard");

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
