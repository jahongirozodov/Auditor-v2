import { prisma } from "@/lib/prisma";
import { requireAgent } from "@/lib/agent/auth";
import { json, clientIp } from "@/lib/agent/util";

/** Open a sync session (agent JWT). Returns the session id for sync/complete. */
export async function POST(req: Request) {
  const auth = await requireAgent(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const { tokenId, auditId, userId } = auth.identity;

  const session = await prisma.agentSyncSession.create({
    data: { tokenId, auditId, userId, status: "open" },
    select: { id: true, startedAt: true },
  });
  await prisma.auditTokenUsageLog.create({
    data: { tokenId, action: "sync.start", status: "ok", ip: clientIp(req) },
  });

  return json({ ok: true, sessionId: session.id, startedAt: session.startedAt });
}
