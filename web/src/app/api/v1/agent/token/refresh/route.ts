import { prisma } from "@/lib/prisma";
import { requireAgent } from "@/lib/agent/auth";
import { signAgentJwt } from "@/lib/agent/jwt";
import { json, clientIp } from "@/lib/agent/util";

const stamp = () => new Date().toISOString().slice(0, 16).replace("T", " ");

/**
 * Re-mint the agent's audit-scoped JWT to extend the session, without re-validating
 * the audit token (agent JWT lifetime < token expiry). Still gated by requireAgent,
 * so a revoked/expired backing token can't refresh.
 */
export async function POST(req: Request) {
  const auth = await requireAgent(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const { userId, auditId, tokenId } = auth.identity;

  const token = await signAgentJwt({ sub: userId, auditId, tokenId });
  await prisma.$transaction([
    prisma.auditToken.update({ where: { id: tokenId }, data: { lastUsed: stamp() } }),
    prisma.auditTokenUsageLog.create({
      data: { tokenId, action: "token.refresh", status: "ok", ip: clientIp(req) },
    }),
  ]);

  return json({ ok: true, token });
}
