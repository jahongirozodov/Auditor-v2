import { prisma } from "@/lib/prisma";
import { requireAgent } from "@/lib/agent/auth";
import { json, clientIp } from "@/lib/agent/util";

/**
 * Tasks for the token's audit assigned to the token's user (agent JWT). The path
 * auditId must match the token's scope — an agent cannot read another audit.
 */
export async function GET(req: Request, ctx: { params: Promise<{ auditId: string }> }) {
  const auth = await requireAgent(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const { auditId } = await ctx.params;
  if (auditId !== auth.identity.auditId) return json({ ok: false, error: "scope" }, 403);

  const tasks = await prisma.task.findMany({
    where: { auditId, assigneeId: auth.identity.userId },
    select: {
      id: true,
      title: true,
      type: true,
      priority: true,
      status: true,
      due: true,
      findings: true,
      files: true,
    },
    orderBy: { id: "asc" },
  });

  await prisma.auditTokenUsageLog.create({
    data: { tokenId: auth.identity.tokenId, action: "my_tasks", status: "ok", ip: clientIp(req) },
  });

  return json({ ok: true, tasks });
}
