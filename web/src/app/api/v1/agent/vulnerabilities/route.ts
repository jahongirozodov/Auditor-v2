import { prisma } from "@/lib/prisma";
import { requireAgent } from "@/lib/agent/auth";
import { json, clientIp } from "@/lib/agent/util";

/** List the findings (vulnerabilities) in the token's audit (agent JWT, scoped). */
export async function GET(req: Request) {
  const auth = await requireAgent(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const { auditId, tokenId } = auth.identity;

  const findings = await prisma.finding.findMany({
    where: { auditId },
    orderBy: { id: "asc" },
    select: {
      id: true,
      title: true,
      severity: true,
      status: true,
      cvss: true,
      asset: true,
      taskId: true,
      evidence: true,
    },
  });

  await prisma.auditTokenUsageLog.create({
    data: { tokenId, action: "vulnerabilities.list", status: "ok", ip: clientIp(req) },
  });

  return json({ ok: true, vulnerabilities: findings });
}
