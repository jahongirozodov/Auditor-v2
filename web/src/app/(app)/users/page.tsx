import { requireSession } from "@/lib/session";
import { getAdminUsers } from "@/lib/data/users";
import { getKpiUsers } from "@/lib/data/kpi";
import { canManage } from "@/lib/rbac";
import { UsersScreen } from "@/components/users/UsersScreen";
import type { RoleCode } from "@/lib/types/roles";

export default async function UsersPage() {
  const { role } = await requireSession();
  const [users, kpi] = await Promise.all([getAdminUsers(), getKpiUsers()]);
  return (
    <UsersScreen
      users={users}
      kpi={kpi}
      canEdit={canManage(role as RoleCode, "users")}
    />
  );
}

export const dynamic = "force-dynamic";
