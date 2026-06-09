import "server-only";
import { prisma } from "@/lib/prisma";

const MAX = Number(process.env.LOGIN_LOCKOUT_ATTEMPTS ?? 5);
const MINUTES = Number(process.env.LOGIN_LOCKOUT_MINUTES ?? 15);

/** True while a lock is still in effect. Pure — unit-tested. */
export function isLocked(lockedUntil: Date | null, now: Date = new Date()): boolean {
  return !!lockedUntil && lockedUntil.getTime() > now.getTime();
}

/** New lock expiry once failures reach the threshold, else null. Pure. */
export function nextLock(failedLogins: number, now: Date = new Date()): Date | null {
  return failedLogins >= MAX ? new Date(now.getTime() + MINUTES * 60_000) : null;
}

export async function recordSuccess(userId: string, email: string, ip?: string) {
  await prisma.$transaction([
    prisma.user.update({ where: { id: userId }, data: { failedLogins: 0, lockedUntil: null } }),
    prisma.loginAttempt.create({ data: { userId, email, success: true, ip } }),
    prisma.auditLog.create({ data: { userId, action: "auth.login", level: "info", ip } }),
  ]);
}

export async function recordFailure(userId: string | null, email: string, ip?: string) {
  if (!userId) {
    await prisma.loginAttempt.create({ data: { email, success: false, ip } });
    await prisma.auditLog.create({
      data: { action: "auth.login.fail", entity: email, level: "warn", ip },
    });
    return;
  }
  const u = await prisma.user.findUnique({ where: { id: userId } });
  const failed = (u?.failedLogins ?? 0) + 1;
  const locked = nextLock(failed);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: { failedLogins: failed, lockedUntil: locked ?? u?.lockedUntil ?? null },
    }),
    prisma.loginAttempt.create({ data: { userId, email, success: false, ip } }),
    prisma.auditLog.create({
      data: {
        userId,
        action: locked ? "auth.lockout" : "auth.login.fail",
        level: locked ? "danger" : "warn",
        ip,
      },
    }),
  ]);
}
