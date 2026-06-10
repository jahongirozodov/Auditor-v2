import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { TrafficAnalysisScreen } from "@/components/analysis/TrafficAnalysisScreen";
import { getLatestTrafficUpload, getLatestTrafficAi } from "@/lib/data/traffic";
import { getAudits } from "@/lib/data/audits";
import { getTasks } from "@/lib/data/tasks";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";

export default async function TrafficPage() {
  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "traffic.upload"))) redirect("/dashboard");

  const [latest, audits, tasks] = await Promise.all([
    getLatestTrafficUpload(),
    getAudits(),
    getTasks(),
  ]);
  const latestAi = latest ? await getLatestTrafficAi(latest.id) : null;

  return <TrafficAnalysisScreen latest={latest} audits={audits} tasks={tasks} latestAi={latestAi} />;
}

export async function generateMetadata() {
  const t = await getTranslations("traffic");
  return { title: t("title") };
}
