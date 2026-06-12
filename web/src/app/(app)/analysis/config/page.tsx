import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { getAudits } from "@/lib/data/audits";
import { getTasks } from "@/lib/data/tasks";
import {
  getAnalyzedDevices,
  getLatestConfigUpload,
  getLatestConfigAi,
  getRecentConfigUploads,
} from "@/lib/data/config";
import { ConfigAnalysisScreen } from "@/components/analysis/ConfigAnalysisScreen";

export default async function ConfigAnalysisPage() {
  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "config.upload"))) redirect("/dashboard");

  const [audits, tasks, devices, latest, uploads] = await Promise.all([
    getAudits(),
    getTasks(),
    getAnalyzedDevices(),
    getLatestConfigUpload(),
    getRecentConfigUploads(),
  ]);
  const latestAi = latest ? await getLatestConfigAi(latest.id) : null;

  return (
    <ConfigAnalysisScreen
      audits={audits}
      tasks={tasks}
      devices={devices}
      latest={latest}
      latestAi={latestAi}
      uploads={uploads}
    />
  );
}
