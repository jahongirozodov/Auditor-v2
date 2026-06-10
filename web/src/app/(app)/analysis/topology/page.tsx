import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { requireAnyPermission } from "@/lib/rbac.server";
import { getTopology, getLatestTopologyAnalysis, pickDefaultAuditId } from "@/lib/data/topology";
import { getFindingsByAudit } from "@/lib/data/findings";
import { getAudits } from "@/lib/data/audits";
import { TopologyScreen } from "@/components/topology/TopologyScreen";

export default async function TopologyPage({
  searchParams,
}: {
  searchParams: Promise<{ audit?: string }>;
}) {
  const { userId } = await requireSession();
  if (!(await requireAnyPermission(userId, ["config.upload", "scanner.import", "traffic.upload", "ai.use"])))
    redirect("/dashboard");

  const [audits, sp] = await Promise.all([getAudits(), searchParams]);
  const auditId = sp.audit || (await pickDefaultAuditId()) || audits[0]?.id || "";

  const [topology, findings, latestAi] = await Promise.all([
    auditId ? getTopology(auditId) : Promise.resolve({ audit: "", nodes: [], edges: [] }),
    auditId ? getFindingsByAudit(auditId) : Promise.resolve([]),
    auditId ? getLatestTopologyAnalysis(auditId) : Promise.resolve(null),
  ]);
  const auditCode = audits.find((a) => a.id === auditId)?.code ?? "";

  return (
    <TopologyScreen
      topology={topology}
      findings={findings}
      auditCode={auditCode}
      audits={audits}
      auditId={auditId}
      latestAi={latestAi}
    />
  );
}
