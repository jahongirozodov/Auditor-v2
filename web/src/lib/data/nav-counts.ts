import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { NavCounts } from "@/lib/nav";

export const getSidebarCounts = cache(async (userId: string): Promise<NavCounts> => {
  const [audits, tasks, findings] = await Promise.all([
    prisma.audit.count(),
    prisma.task.count({ where: { assigneeId: userId } }),
    prisma.finding.count(),
  ]);

  return { audits, tasks, findings };
});
