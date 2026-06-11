// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({ requireSession: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    notification: { updateMany: vi.fn(), count: vi.fn(), findMany: vi.fn() },
  },
}));
vi.mock("@/lib/data/notifications", () => ({
  getRecentNotifications: vi.fn(),
  getUnreadCount: vi.fn(),
}));

import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { markNotificationRead, markAllNotificationsRead } from "./notifications";

beforeEach(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(requireSession).mockResolvedValue({ userId: "me" } as any);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  vi.mocked(prisma.notification.updateMany).mockResolvedValue({ count: 1 } as any);
});

describe("notification actions", () => {
  it("markNotificationRead scopes the update to the caller", async () => {
    await markNotificationRead("n1");
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { id: "n1", userId: "me", readAt: null },
      data: { readAt: expect.any(Date) },
    });
  });

  it("markAllNotificationsRead clears all unread for the caller", async () => {
    await markAllNotificationsRead();
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: "me", readAt: null },
      data: { readAt: expect.any(Date) },
    });
  });
});
