import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { Topbar } from "./Topbar";
import type { ShellUser } from "./AppShell";

vi.mock("@/app/(app)/actions", () => ({ logoutAction: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const USER: ShellUser = {
  id: "u1",
  name: "Akmal Yoʻldoshev",
  title: "Departament rahbari",
  avatar: "AY",
  role: "super",
};

function renderTopbar() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <Topbar user={USER} onToggleSidebar={() => {}} />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  document.documentElement.removeAttribute("data-theme");
});

describe("Topbar", () => {
  it("renders the brand and current user", () => {
    renderTopbar();
    expect(screen.getByText("Auditor")).toBeInTheDocument();
    expect(screen.getByText("Akmal Yoʻldoshev")).toBeInTheDocument();
  });

  it("toggles the theme attribute on <html>", async () => {
    renderTopbar();
    expect(document.documentElement.getAttribute("data-theme")).not.toBe("light");
    await userEvent.click(screen.getByRole("button", { name: "Mavzuni almashtirish" }));
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("opens the user menu and shows logout", async () => {
    renderTopbar();
    await userEvent.click(screen.getByRole("button", { name: /Akmal/ }));
    expect(screen.getByRole("menuitem", { name: /Tizimdan chiqish/ })).toBeInTheDocument();
  });

  it("collapse button fires the callback", async () => {
    const onToggle = vi.fn();
    render(
      <NextIntlClientProvider locale="uz" messages={messages}>
        <Topbar user={USER} onToggleSidebar={onToggle} />
      </NextIntlClientProvider>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Menyuni yigʻish" }));
    expect(onToggle).toHaveBeenCalledOnce();
  });
});
