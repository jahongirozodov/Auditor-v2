import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { OrgsScreen } from "./OrgsScreen";
import { AUDITS, ORGS, ORG_DETAIL } from "@/lib/fixtures";

vi.mock("@/lib/actions/orgs", () => ({
  createOrganization: vi.fn(async () => ({ ok: true, id: "org_1" })),
  updateOrganization: vi.fn(async () => ({ ok: true })),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const activeAuditCount = AUDITS.filter(
  (a) => a.status !== "approved" && a.status !== "cancelled",
).length;

function renderScreen() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <OrgsScreen orgs={ORGS} orgDetails={ORG_DETAIL} activeAuditCount={activeAuditCount} />
    </NextIntlClientProvider>,
  );
}

describe("OrgsScreen", () => {
  it("renders the title and an org row linking to its detail", () => {
    renderScreen();
    expect(screen.getByRole("heading", { name: "Tashkilotlar" })).toBeInTheDocument();
    const link = screen.getByRole("link", { name: "Aloqa va kommunikatsiya vazirligi" });
    expect(link).toHaveAttribute("href", "/organizations/o1");
  });

  it("opens the create organization dialog", async () => {
    renderScreen();
    await userEvent.click(screen.getByRole("button", { name: "Tashkilot qoʻshish" }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Qoʻshish" })).toBeDisabled();
  });

  it("opens edit dialog with the selected organization", async () => {
    renderScreen();
    await userEvent.click(
      screen.getByRole("button", {
        name: "Aloqa va kommunikatsiya vazirligi tashkilotini tahrirlash",
      }),
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Tashkilot nomi")).toHaveValue(
      "Aloqa va kommunikatsiya vazirligi",
    );
  });
});
