import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { requireAnyPermission } from "@/lib/rbac.server";
import {
  getAgentOverview,
  getSyncSessions,
  getTokenUsage,
  getAgentVersion,
  getSyncedFindings,
} from "@/lib/data/agent";
import { getAllTokens } from "@/lib/data/tokens";
import { getUsersById } from "@/lib/data/users";
import { getAudits } from "@/lib/data/audits";
import { AgentScreen } from "@/components/agent/AgentScreen";

export default async function AgentPage() {
  const { userId } = await requireSession();
  if (!(await requireAnyPermission(userId, ["agent.token", "agent.revoke"])))
    redirect("/dashboard");

  const [overview, syncs, usage, version, tokens, usersById, audits, syncedFindings] =
    await Promise.all([
      getAgentOverview(),
      getSyncSessions(),
      getTokenUsage(),
      getAgentVersion(),
      getAllTokens(),
      getUsersById(),
      getAudits(),
      getSyncedFindings(),
    ]);

  const auditCodeById: Record<string, string> = {};
  for (const a of audits) auditCodeById[a.id] = a.code;

  return (
    <AgentScreen
      overview={overview}
      syncs={syncs}
      usage={usage}
      version={version}
      tokens={tokens}
      usersById={usersById}
      auditCodeById={auditCodeById}
      syncedFindings={syncedFindings}
    />
  );
}

export const dynamic = "force-dynamic";
