import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { OrgsScreen } from "./OrgsScreen";
import { AUDITS, ORGS, ORG_DETAIL } from "@/lib/fixtures";

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

  it("renders a risk tag per org", () => {
    renderScreen();
    expect(screen.getAllByText("Yuqori xavf").length).toBeGreaterThan(0);
  });
});
