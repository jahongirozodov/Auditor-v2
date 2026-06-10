import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getKpiUsers } from "@/lib/data/kpi";
import { getAudits } from "@/lib/data/audits";
import { getTasks } from "@/lib/data/tasks";
import { getFindings } from "@/lib/data/findings";
import { getAuditLogs } from "@/lib/data/logs";
import { getAllTokens } from "@/lib/data/tokens";
import type { Audit, AuditLogView, AuditToken, Finding, KpiUser, Task } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

/** The logged-in user's own record, including profile-only fields (email/phones). */
export interface ProfileUser {
  id: string;
  name: string;
  role: RoleCode;
  title: string;
  avatar: string;
  dept: string;
  email: string;
  phone: string | null;
  workPhone: string | null;
}

export interface ProfileData {
  user: ProfileUser;
  kpi: KpiUser;
  myAudits: Audit[];
  myTasks: Task[];
  myFindings: Finding[];
  activity: AuditLogView[];
  tokens: AuditToken[];
  /** ISO timestamp of the latest successful login, or null. */
  lastLogin: string | null;
}

const EMPTY_KPI = (user: string): KpiUser => ({
  user,
  audits: 0,
  tasks: 0,
  findings: 0,
  total: 0,
  delta: 0,
  sparkline: [],
});

/** Aggregate everything the profile page renders for one user, in one round of queries. */
export const getProfileData = cache(async (userId: string): Promise<ProfileData> => {
  const [row, kpiUsers, audits, tasks, findings, logs, tokens] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      include: {
        loginAttempts: {
          where: { success: true },
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { createdAt: true },
        },
      },
    }),
    getKpiUsers(),
    getAudits(),
    getTasks(),
    getFindings(),
    getAuditLogs(250),
    getAllTokens(),
  ]);

  const user: ProfileUser = row
    ? {
        id: row.id,
        name: row.name,
        role: row.role as RoleCode,
        title: row.title,
        avatar: row.avatar,
        dept: row.dept,
        email: row.email,
        phone: row.phone,
        workPhone: row.workPhone,
      }
    : {
        id: userId,
        name: userId,
        role: "t1",
        title: "",
        avatar: "?",
        dept: "",
        email: "",
        phone: null,
        workPhone: null,
      };

  return {
    user,
    kpi: kpiUsers.find((k) => k.user === userId) ?? EMPTY_KPI(userId),
    myAudits: audits.filter((a) => a.leader === userId || a.members.includes(userId)),
    myTasks: tasks.filter((t) => t.assignee === userId),
    myFindings: findings.filter((f) => f.reportedBy === userId),
    activity: logs.filter((l) => l.userId === userId).slice(0, 20),
    tokens: tokens.filter((t) => t.user === userId),
    lastLogin: row?.loginAttempts[0]?.createdAt.toISOString() ?? null,
  };
});
