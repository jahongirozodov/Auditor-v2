import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { canView } from "@/lib/rbac";
import { getAudits } from "@/lib/data/audits";
import { getTasks } from "@/lib/data/tasks";
import { getRecentScannerImports } from "@/lib/data/scanner";
import { ScannerImportScreen } from "@/components/analysis/ScannerImportScreen";

export default async function ScannerPage() {
  const { role } = await requireSession();
  if (!canView(role, "config")) redirect("/dashboard");

  const [audits, tasks, imports] = await Promise.all([
    getAudits(),
    getTasks(),
    getRecentScannerImports(),
  ]);

  return <ScannerImportScreen audits={audits} tasks={tasks} imports={imports} />;
}
