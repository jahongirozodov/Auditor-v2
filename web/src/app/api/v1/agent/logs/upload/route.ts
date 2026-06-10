import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAgent } from "@/lib/agent/auth";
import { json, clientIp } from "@/lib/agent/util";

const Entry = z.object({
  ts: z.string().max(40),
  level: z.string().max(12),
  message: z.string().max(2000),
});
const Body = z.object({ logs: z.array(Entry).min(1).max(200) });

const levelOf = (l: string) =>
  l.toUpperCase() === "WARN" ? "warn" : l.toUpperCase() === "ERROR" ? "danger" : "info";

/**
 * Upload the agent's local debug log to the server (agent JWT). Each line becomes an
 * append-only AuditLog row tagged `agent.log` (actor = the token's user).
 */
export async function POST(req: Request) {
  const auth = await requireAgent(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const { userId, auditId, tokenId } = auth.identity;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ ok: false, error: "invalid" }, 400);

  await prisma.auditLog.createMany({
    data: parsed.data.logs.map((e) => ({
      userId,
      action: "agent.log",
      entity: tokenId,
      level: levelOf(e.level),
      ip: clientIp(req),
      payload: JSON.parse(JSON.stringify({ auditId, ts: e.ts, message: e.message })),
    })),
  });
  await prisma.auditTokenUsageLog.create({
    data: { tokenId, action: "logs.upload", status: "ok", ip: clientIp(req) },
  });

  return json({ ok: true, stored: parsed.data.logs.length });
}
