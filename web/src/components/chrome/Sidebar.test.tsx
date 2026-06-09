import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { Sidebar } from "./Sidebar";
import type { RoleCode } from "@/lib/types/roles";

vi.mock("next/navigation", () => ({ usePathname: () => "/dashboard" }));

function renderSidebar(role: RoleCode) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <Sidebar role={role} />
    </NextIntlClientProvider>,
  );
}

describe("Sidebar", () => {
  it("shows common items to every role", () => {
    renderSidebar("t1");
    expect(screen.getByRole("link", { name: /Boshqaruv paneli/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Findinglar/ })).toBeInTheDocument();
  });

  it("super sees admin items (permissions, users, tokens, settings)", () => {
    renderSidebar("super");
    expect(screen.getByRole("link", { name: /Rollar va ruxsatlar/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Foydalanuvchilar/ })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Audit tokenlar/ })).toBeInTheDocument();
  });

  it("head sees users/tokens but NOT permissions", () => {
    renderSidebar("head");
    expect(screen.getByRole("link", { name: /Foydalanuvchilar/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Rollar va ruxsatlar/ })).toBeNull();
  });

  it("t1 sees none of the admin-only items", () => {
    renderSidebar("t1");
    expect(screen.queryByRole("link", { name: /Rollar va ruxsatlar/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /Foydalanuvchilar/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /Audit tokenlar/ })).toBeNull();
  });

  it("marks the active route", () => {
    renderSidebar("super");
    expect(screen.getByRole("link", { name: /Boshqaruv paneli/ })).toHaveClass("is-active");
  });
});
