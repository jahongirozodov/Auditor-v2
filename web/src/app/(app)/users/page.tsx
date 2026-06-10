import { requireSession } from "@/lib/session";
import { getAdminUsers } from "@/lib/data/users";
import { getKpiUsers } from "@/lib/data/kpi";
import { getCustomRoles } from "@/lib/data/settings";
import { requireAnyPermission } from "@/lib/rbac.server";
import { UsersScreen } from "@/components/users/UsersScreen";

export default async function UsersPage() {
  const { userId } = await requireSession();
  const [users, kpi, customRoles, canEdit] = await Promise.all([
    getAdminUsers(),
    getKpiUsers(),
    getCustomRoles(),
    requireAnyPermission(userId, ["user.create", "user.update", "user.disable"]),
  ]);
  return <UsersScreen users={users} kpi={kpi} customRoles={customRoles} canEdit={canEdit} />;
}

export const dynamic = "force-dynamic";
