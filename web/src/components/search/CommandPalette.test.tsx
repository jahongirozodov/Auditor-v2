import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

import { CommandPalette } from "./CommandPalette";

function renderPalette() {
  const onClose = vi.fn();
  render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <CommandPalette onClose={onClose} />
    </NextIntlClientProvider>,
  );
  return { onClose };
}

beforeEach(() => push.mockClear());

describe("CommandPalette", () => {
  it("shows default pages (no query)", () => {
    renderPalette();
    expect(screen.getByText("Boshqaruv paneli")).toBeInTheDocument();
    expect(screen.getByText("Sahifalar")).toBeInTheDocument();
  });

  it("searches and navigates on Enter", async () => {
    renderPalette();
    await userEvent.type(screen.getByRole("textbox"), "Soliq{Enter}");
    expect(push).toHaveBeenCalledWith("/audits/AUD-2026-013");
  });

  it("navigates to a page result on click", async () => {
    renderPalette();
    await userEvent.click(screen.getByText("Tashkilotlar"));
    expect(push).toHaveBeenCalledWith("/organizations");
  });

  it("closes on Escape", async () => {
    const { onClose } = renderPalette();
    await userEvent.type(screen.getByRole("textbox"), "{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("shows an empty state for no matches", async () => {
    renderPalette();
    await userEvent.type(screen.getByRole("textbox"), "zzzznomatch");
    expect(screen.getByText(/hech narsa topilmadi/)).toBeInTheDocument();
  });
});
