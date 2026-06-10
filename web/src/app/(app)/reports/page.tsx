import { requireSession } from "@/lib/session";
import { getReports } from "@/lib/data/reports";
import { getAudits } from "@/lib/data/audits";
import { getUsersById } from "@/lib/data/users";
import { ReportsScreen } from "@/components/reports/ReportsScreen";

export default async function ReportsPage() {
  await requireSession();
  const [reports, audits, usersById] = await Promise.all([
    getReports(),
    getAudits(),
    getUsersById(),
  ]);
  return <ReportsScreen reports={reports} audits={audits} usersById={usersById} />;
}

export const dynamic = "force-dynamic";
