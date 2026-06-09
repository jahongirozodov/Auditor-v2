import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { CreateAuditModal } from "./CreateAuditModal";
import { ORGS, USERS } from "@/lib/fixtures";

vi.mock("@/lib/actions/audits", () => ({
  createAudit: vi.fn(async () => ({ ok: true, id: "AUD-2026-016" })),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const eligible = USERS.filter((u) => ["chief", "lead", "t1"].includes(u.role));

function renderModal(onClose = vi.fn()) {
  render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <CreateAuditModal open onClose={onClose} orgs={ORGS} eligibleUsers={eligible} />
    </NextIntlClientProvider>,
  );
  return onClose;
}

describe("CreateAuditModal", () => {
  it("renders the form and disables create until valid", () => {
    renderModal();
    expect(screen.getByText(/Yangi audit yaratish/)).toBeInTheDocument();
    expect(screen.getByLabelText("Audit nomi")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Yaratish" })).toBeDisabled();
  });

  it("cancel calls onClose", async () => {
    const onClose = renderModal();
    await userEvent.click(screen.getByRole("button", { name: "Bekor qilish" }));
    expect(onClose).toHaveBeenCalled();
  });
});
