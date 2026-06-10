import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { getAudits } from "@/lib/data/audits";
import { getTasks } from "@/lib/data/tasks";
import {
  getRecentScannerImports,
  getLatestScannerUpload,
  getLatestScannerNormalization,
} from "@/lib/data/scanner";
import { ScannerImportScreen } from "@/components/analysis/ScannerImportScreen";

export default async function ScannerPage() {
  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "scanner.import"))) redirect("/dashboard");

  const [audits, tasks, imports, latest] = await Promise.all([
    getAudits(),
    getTasks(),
    getRecentScannerImports(),
    getLatestScannerUpload(),
  ]);
  const latestAi = latest ? await getLatestScannerNormalization(latest.id) : null;

  return (
    <ScannerImportScreen
      audits={audits}
      tasks={tasks}
      imports={imports}
      latest={latest}
      latestAi={latestAi}
    />
  );
}
