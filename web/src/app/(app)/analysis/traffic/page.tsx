import { getTranslations } from "next-intl/server";
import { TrafficAnalysisScreen } from "@/components/analysis/TrafficAnalysisScreen";
import { getLatestTrafficUpload } from "@/lib/data/traffic";
import { getAudits } from "@/lib/data/audits";
import { getTasks } from "@/lib/data/tasks";

export default async function TrafficPage() {
  const t = await getTranslations("traffic");
  const [latest, audits, tasks] = await Promise.all([
    getLatestTrafficUpload(),
    getAudits(),
    getTasks(),
  ]);

  return (
    <TrafficAnalysisScreen
      latest={latest}
      audits={audits}
      tasks={tasks}
    />
  );
}

export async function generateMetadata() {
  const t = await getTranslations("traffic");
  return { title: t("title") };
}
