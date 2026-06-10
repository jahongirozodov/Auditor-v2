import { prisma } from "@/lib/prisma";
import { requireAgent } from "@/lib/agent/auth";
import { json, clientIp } from "@/lib/agent/util";

/**
 * Agent self-revokes its audit token (Settings → "Logout & token bekor qilish").
 * After this the token is dead — requireAgent rejects every later call (TZ §16.3).
 */
export async function POST(req: Request) {
  const auth = await requireAgent(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const { tokenId, auditId, userId } = auth.identity;

  await prisma.$transaction([
    prisma.auditToken.update({ where: { id: tokenId }, data: { status: "revoked" } }),
    prisma.auditTokenUsageLog.create({
      data: { tokenId, action: "token.revoke", status: "revoked", ip: clientIp(req) },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: "agent.token.revoke",
        entity: tokenId,
        level: "warn",
        payload: JSON.parse(JSON.stringify({ auditId })),
      },
    }),
  ]);

  return json({ ok: true });
}
