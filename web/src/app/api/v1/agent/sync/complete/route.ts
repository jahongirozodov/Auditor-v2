import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAgent } from "@/lib/agent/auth";
import { json, clientIp } from "@/lib/agent/util";
import { emitNotification } from "@/lib/notifications/emit";

const Body = z.object({
  sessionId: z.string().min(1),
  findingCount: z.number().int().nonnegative().default(0),
  status: z.enum(["completed", "failed"]).default("completed"),
});

/** Close a sync session (agent JWT). Records counts + a server-side audit log. */
export async function POST(req: Request) {
  const auth = await requireAgent(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const { tokenId, auditId, userId } = auth.identity;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ ok: false, error: "invalid" }, 400);
  const { sessionId, findingCount, status } = parsed.data;

  const session = await prisma.agentSyncSession.findUnique({
    where: { id: sessionId },
    select: { tokenId: true, status: true },
  });
  if (!session || session.tokenId !== tokenId) return json({ ok: false, error: "not_found" }, 404);
  if (session.status !== "open") return json({ ok: false, error: "already_closed" }, 409);

  const audit = await prisma.audit.findUnique({
    where: { id: auditId },
    select: { leaderId: true, title: true },
  });

  await prisma.$transaction(async (tx) => {
    await tx.agentSyncSession.update({
      where: { id: sessionId },
      data: { status, findingCount, completedAt: new Date() },
    });
    await tx.auditTokenUsageLog.create({
      data: { tokenId, action: "sync.complete", status, ip: clientIp(req) },
    });
    await tx.auditLog.create({
      data: {
        userId,
        action: "agent.sync.complete",
        entity: sessionId,
        level: status === "failed" ? "warn" : "info",
        payload: JSON.parse(JSON.stringify({ auditId, findingCount, status })),
      },
    });
    if (status === "completed" && audit) {
      await emitNotification(tx, {
        type: "sync_complete",
        recipients: [audit.leaderId].filter(Boolean) as string[],
        actorId: userId,
        params: { audit: audit.title, count: findingCount },
        href: `/audits/${auditId}`,
        auditId,
        entityType: "audit",
        entityId: auditId,
      });
    }
  });

  return json({ ok: true });
}
