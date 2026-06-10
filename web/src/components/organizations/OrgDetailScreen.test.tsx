import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { OrgDetailScreen } from "./OrgDetailScreen";
import { AUDITS, ORGS, ORG_DETAIL } from "@/lib/fixtures";

function renderDetail(id: string) {
  const org = ORGS.find((o) => o.id === id);
  const det = ORG_DETAIL[id];
  const orgAudits = AUDITS.filter((a) => a.org === id);
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <OrgDetailScreen org={org} det={det} orgAudits={orgAudits} />
    </NextIntlClientProvider>,
  );
}

describe("OrgDetailScreen", () => {
  it("renders the org name, info, devices and contacts", () => {
    renderDetail("o1");
    expect(
      screen.getByRole("heading", { name: "Aloqa va kommunikatsiya vazirligi" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Qurilma inventari")).toBeInTheDocument();
    expect(screen.getByText("FW-CORE-01")).toBeInTheDocument();
    expect(screen.getByText("Rustam Qodirov")).toBeInTheDocument();
  });

  it("shows a not-found state for an unknown org", () => {
    renderDetail("nope");
    expect(screen.getByRole("heading", { name: "Tashkilot topilmadi" })).toBeInTheDocument();
  });

  it("links organization audit rows to the audit detail page", () => {
    renderDetail("o2");
    expect(screen.getByRole("link", { name: "AUD-2026-013" })).toHaveAttribute(
      "href",
      "/audits/AUD-2026-013",
    );
    expect(screen.getByRole("link", { name: /DBMS va loyiha auditi/ })).toHaveAttribute(
      "href",
      "/audits/AUD-2026-013",
    );
  });
});
