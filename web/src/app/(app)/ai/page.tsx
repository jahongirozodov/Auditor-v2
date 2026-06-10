import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import { getAudits } from "@/lib/data/audits";
import { getOrgs } from "@/lib/data/orgs";
import { getOllamaConfig } from "@/lib/ai/ollama";
import { AiScreen } from "@/components/ai/AiScreen";

export default async function AiPage() {
  const { userId, name } = await requireSession();
  if (!(await requirePermission(userId, "ai.use"))) redirect("/dashboard");

  const [audits, orgs] = await Promise.all([getAudits(), getOrgs()]);
  const orgsById = Object.fromEntries(orgs.map((o) => [o.id, o.name]));
  const { model } = getOllamaConfig();

  return <AiScreen audits={audits} orgsById={orgsById} userName={name} model={model} />;
}
