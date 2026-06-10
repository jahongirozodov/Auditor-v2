import { requireSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { requireAnyPermission } from "@/lib/rbac.server";
import { getReports } from "@/lib/data/reports";
import { getAudits } from "@/lib/data/audits";
import { getUsersById } from "@/lib/data/users";
import { ReportsScreen } from "@/components/reports/ReportsScreen";

export default async function ReportsPage() {
  const { role, userId } = await requireSession();
  if (!(await requireAnyPermission(userId, ["report.create", "report.approve", "report.export"])))
    redirect("/dashboard");
  const [reports, audits, usersById] = await Promise.all([
    getReports(),
    getAudits(),
    getUsersById(),
  ]);
  return (
    <ReportsScreen
      reports={reports}
      audits={audits}
      usersById={usersById}
      role={role}
      currentUserId={userId}
    />
  );
}

export const dynamic = "force-dynamic";
