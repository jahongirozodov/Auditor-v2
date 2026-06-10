import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signAgentJwt } from "@/lib/agent/jwt";
import { json, clientIp, isTokenExpired } from "@/lib/agent/util";

const Body = z.object({
  token: z.string().min(1),
  hostname: z.string().max(120).optional(),
  os: z.string().max(120).optional(),
  agentVersion: z.string().max(60).optional(),
});

const stamp = () => new Date().toISOString().slice(0, 16).replace("T", " ");

/**
 * Validate a pasted audit token (anonymous). On success: bind the device identity,
 * log the use (TZ §16.3), and mint an audit-scoped agent JWT. The agent sees only
 * its own audit thereafter (isolation boundary).
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ ok: false, error: "invalid" }, 400);
  const { token, hostname, os, agentVersion } = parsed.data;
  const ip = clientIp(req);

  const row = await prisma.auditToken.findUnique({ where: { id: token } });
  const logUse = (status: string) =>
    prisma.auditTokenUsageLog.create({
      data: { tokenId: token, action: "validate", status, ip },
    });

  if (!row) {
    await logUse("not_found");
    return json({ ok: false, error: "not_found" }, 404);
  }
  if (row.status !== "active") {
    await logUse(row.status);
    return json({ ok: false, error: "token_inactive" }, 403);
  }
  if (isTokenExpired(row.expires)) {
    await prisma.$transaction([
      prisma.auditToken.update({ where: { id: token }, data: { status: "expired" } }),
      prisma.auditTokenUsageLog.create({
        data: { tokenId: token, action: "validate", status: "expired", ip },
      }),
    ]);
    return json({ ok: false, error: "expired" }, 403);
  }

  const audit = await prisma.audit.findUnique({
    where: { id: row.auditId },
    select: {
      id: true,
      code: true,
      title: true,
      org: { select: { name: true } },
      leader: { select: { name: true } },
      tasksAgg: true,
      findings: true,
    },
  });

  await prisma.$transaction([
    prisma.auditToken.update({
      where: { id: token },
      data: {
        hostname: hostname?.trim() || row.hostname,
        os: os?.trim() || row.os,
        agent: agentVersion?.trim() || row.agent,
        ip: ip ?? row.ip,
        lastUsed: stamp(),
      },
    }),
    prisma.auditTokenUsageLog.create({
      data: { tokenId: token, action: "validate", status: "ok", ip },
    }),
  ]);

  const jwt = await signAgentJwt({ sub: row.userId, auditId: row.auditId, tokenId: row.id });
  return json({
    ok: true,
    token: jwt,
    context: {
      auditId: row.auditId,
      code: audit?.code ?? null,
      title: audit?.title ?? null,
      organization: audit?.org.name ?? null,
      groupLead: audit?.leader.name ?? null,
      tasks: audit?.tasksAgg ?? null,
      findings: audit?.findings ?? null,
    },
  });
}
