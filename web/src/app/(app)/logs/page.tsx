import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { queryAuditLogs } from "@/lib/data/logs";
import { getUsers } from "@/lib/data/users";
import { LogsScreen } from "@/components/logs/LogsScreen";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const { userId, role } = await requireSession();
  if (!(await requirePermission(userId, "system.audit_log"))) redirect("/dashboard");

  const admin = role === "super" || role === "head";
  const [initial, users] = await Promise.all([
    queryAuditLogs(userId, role, {}),
    admin ? getUsers() : Promise.resolve([]),
  ]);

  return <LogsScreen initial={initial} isAdmin={admin} users={users} />;
}
