import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { NotificationsScreen } from "./NotificationsScreen";

vi.mock("@/lib/actions/notifications", () => ({
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const messages = {
  notifications: {
    title: "Bildirishnomalar",
    empty: "Bildirishnomalar yoʻq",
    filterAll: "Hammasi",
    filterUnread: "Oʻqilmagan",
    markAllRead: "Hammasini oʻqilgan deb belgilash",
    types: { task_returned: "Vazifa qaytarildi: {title}" },
  },
};

describe("NotificationsScreen", () => {
  it("renders rows from props", () => {
    render(
      <NextIntlClientProvider locale="uz" messages={messages}>
        <NotificationsScreen
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          items={[{ id: "n1", type: "task_returned", params: { title: "T1" }, href: "/tasks/1", readAt: null, createdAt: new Date().toISOString() } as any]}
        />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Vazifa qaytarildi: T1")).toBeInTheDocument();
  });

  it("shows empty state for no rows", () => {
    render(
      <NextIntlClientProvider locale="uz" messages={messages}>
        <NotificationsScreen items={[]} />
      </NextIntlClientProvider>,
    );
    expect(screen.getByText("Bildirishnomalar yoʻq")).toBeInTheDocument();
  });
});
