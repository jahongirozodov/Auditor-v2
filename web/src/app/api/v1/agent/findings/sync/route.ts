import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAgent } from "@/lib/agent/auth";
import { materializeFindings, type FindingRowInput } from "@/lib/actions/findings";
import { json, clientIp } from "@/lib/agent/util";

const Finding = z.object({
  idempotencyKey: z.string().min(8).max(100),
  taskId: z.string().min(1),
  title: z.string().min(3),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  cvss: z.number().min(0).max(10),
  cwe: z.string().default("CWE-284"),
  asset: z.string().default(""),
  type: z.string().min(1),
  description: z.string().default(""),
});
const Body = z.object({ findings: z.array(Finding).min(1).max(200) });

/**
 * Batch-sync offline findings (agent JWT). Idempotent: any idempotencyKey already
 * present (from a prior sync) is skipped, so re-running a sync never duplicates
 * (TZ §9.5). New rows go through the shared materializeFindings path (audit-log +
 * KPI come free). Every referenced task must belong to the token's audit.
 */
export async function POST(req: Request) {
  const auth = await requireAgent(req);
  if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
  const { userId, auditId, tokenId } = auth.identity;

  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ ok: false, error: "invalid" }, 400);

  // Dedup within the batch (first occurrence wins).
  const seen = new Set<string>();
  const batch = parsed.data.findings.filter((f) => {
    if (seen.has(f.idempotencyKey)) return false;
    seen.add(f.idempotencyKey);
    return true;
  });

  // Every task must be inside the token's audit (scope boundary).
  const taskIds = [...new Set(batch.map((f) => f.taskId))];
  const tasks = await prisma.task.findMany({
    where: { id: { in: taskIds } },
    select: { id: true, auditId: true },
  });
  const taskAudit = new Map(tasks.map((t) => [t.id, t.auditId]));
  if (batch.some((f) => taskAudit.get(f.taskId) !== auditId)) {
    return json({ ok: false, error: "task_scope" }, 403);
  }

  // Skip keys already synced (the unique constraint is the hard guard; this avoids
  // a failed transaction and reports the skip count).
  const keys = batch.map((f) => f.idempotencyKey);
  const existing = await prisma.finding.findMany({
    where: { idempotencyKey: { in: keys } },
    select: { idempotencyKey: true },
  });
  const done = new Set(existing.map((e) => e.idempotencyKey));
  const fresh = batch.filter((f) => !done.has(f.idempotencyKey));

  const inputs: FindingRowInput[] = fresh.map((f) => ({
    auditId,
    taskId: f.taskId,
    title: f.title,
    severity: f.severity,
    cvss: f.cvss,
    cwe: f.cwe,
    asset: f.asset,
    type: f.type,
    description: f.description,
    idempotencyKey: f.idempotencyKey,
  }));

  const ids = await materializeFindings(userId, inputs, "agent");

  await prisma.auditTokenUsageLog.create({
    data: { tokenId, action: "findings.sync", status: "ok", ip: clientIp(req) },
  });

  // skipped = everything submitted that did not become a row: within-batch
  // duplicates + keys already synced in a prior run.
  return json({
    ok: true,
    created: ids.length,
    skipped: parsed.data.findings.length - ids.length,
    findingIds: ids,
  });
}
