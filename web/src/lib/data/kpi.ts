import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { KpiUser, KpiRule } from "@/lib/types/entities";

export const getKpiUsers = cache(async (): Promise<KpiUser[]> => {
  const rows = await prisma.kpiUser.findMany({ orderBy: { total: "desc" } });
  return rows.map((k) => ({
    user: k.userId,
    audits: k.audits,
    tasks: k.tasks,
    findings: k.findings,
    total: k.total,
    delta: k.delta,
    sparkline: k.sparkline as number[],
  }));
});

export const getKpiRules = cache(async (): Promise<KpiRule[]> => {
  const rows = await prisma.kpiRule.findMany({
    where: { active: true },
    orderBy: { points: "desc" },
  });
  return rows.map((r) => ({ code: r.code, label: r.label, points: r.points }));
});
