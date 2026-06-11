import "server-only";
import { prisma } from "@/lib/prisma";

const RECENT_TAKE = 20;
const PAGE_TAKE = 50;

export function getUnreadCount(userId: string) {
  return prisma.notification.count({ where: { userId, readAt: null } });
}

export function getRecentNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: RECENT_TAKE,
  });
}

export function listNotifications(userId: string, opts?: { unreadOnly?: boolean }) {
  return prisma.notification.findMany({
    where: { userId, ...(opts?.unreadOnly ? { readAt: null } : {}) },
    orderBy: { createdAt: "desc" },
    take: PAGE_TAKE,
  });
}
