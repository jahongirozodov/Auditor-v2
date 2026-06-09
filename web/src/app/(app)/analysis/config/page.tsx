import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { canView } from "@/lib/rbac";
import { getAudits } from "@/lib/data/audits";
import { getTasks } from "@/lib/data/tasks";
import { getAnalyzedDevices, getLatestConfigUpload } from "@/lib/data/config";
import { ConfigAnalysisScreen } from "@/components/analysis/ConfigAnalysisScreen";

export default async function ConfigAnalysisPage() {
  const { role } = await requireSession();
  if (!canView(role, "config")) redirect("/dashboard");

  const [audits, tasks, devices, latest] = await Promise.all([
    getAudits(),
    getTasks(),
    getAnalyzedDevices(),
    getLatestConfigUpload(),
  ]);

  return <ConfigAnalysisScreen audits={audits} tasks={tasks} devices={devices} latest={latest} />;
}
