import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { NotifBell } from "./NotifBell";

vi.mock("@/lib/actions/notifications", () => ({
  pollNotifications: vi.fn().mockResolvedValue({
    items: [],
    unread: 0,
  }),
  markNotificationRead: vi.fn(),
  markAllNotificationsRead: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const messages = {
  shell: { notifications: "Bildirishnomalar" },
  notifications: {
    title: "Bildirishnomalar",
    markAllRead: "Hammasini oʻqilgan deb belgilash",
    all: "Barcha bildirishnomalar",
    empty: "Bildirishnomalar yoʻq",
    filterAll: "Hammasi",
    filterUnread: "Oʻqilmagan",
    types: {},
  },
};

describe("NotifBell", () => {
  it("renders the bell button with accessible label", () => {
    render(
      <NextIntlClientProvider locale="uz" messages={messages}>
        <NotifBell />
      </NextIntlClientProvider>,
    );
    expect(screen.getByLabelText("Bildirishnomalar")).toBeInTheDocument();
  });

  it("does not show unread dot when unread is 0", () => {
    const { container } = render(
      <NextIntlClientProvider locale="uz" messages={messages}>
        <NotifBell />
      </NextIntlClientProvider>,
    );
    expect(container.querySelector(".dot")).toBeNull();
  });
});
