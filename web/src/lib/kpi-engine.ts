import "server-only";
import type { Prisma } from "@prisma/client";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));

export const SEVERITY_BONUS: Record<string, string> = {
  critical: "vuln_critical_bonus",
  high: "vuln_high_bonus",
  medium: "vuln_medium_bonus",
  low: "vuln_low_bonus",
};

const BONUS_PTS: Record<string, number> = {
  vuln_critical_bonus: 10,
  vuln_high_bonus: 7,
  vuln_medium_bonus: 4,
  vuln_low_bonus: 1,
};

export { BONUS_PTS };

export async function emitKpiEvent(
  tx: Prisma.TransactionClient,
  opts: {
    userId: string;
    ruleCode: string;
    points: number;
    auditId?: string;
    payload?: Record<string, unknown>;
    countField?: "audits" | "tasks" | "findings";
  },
): Promise<void> {
  const { userId, ruleCode, points, auditId, payload, countField } = opts;
  await tx.kpiEvent.create({
    data: {
      userId,
      ruleCode,
      points,
      auditId: auditId ?? null,
      payload: payload ? J(payload) : null,
    },
  });
  const countUpdate = countField ? { [countField]: { increment: 1 } } : {};
  await tx.kpiUser.upsert({
    where: { userId },
    update: { total: { increment: points }, ...countUpdate },
    create: {
      userId,
      total: Math.max(0, points),
      audits: 0,
      tasks: 0,
      findings: 0,
      delta: points,
      sparkline: J([]),
      ...countUpdate,
    },
  });
}
