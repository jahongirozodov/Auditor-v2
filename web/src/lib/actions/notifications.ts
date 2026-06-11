"use server";

import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { getRecentNotifications, getUnreadCount } from "@/lib/data/notifications";

export async function pollNotifications() {
  const { userId } = await requireSession();
  const [items, unread] = await Promise.all([
    getRecentNotifications(userId),
    getUnreadCount(userId),
  ]);
  return { items, unread };
}

export async function markNotificationRead(id: string) {
  const { userId } = await requireSession();
  await prisma.notification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
}

export async function markAllNotificationsRead() {
  const { userId } = await requireSession();
  await prisma.notification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
  revalidatePath("/notifications");
}
