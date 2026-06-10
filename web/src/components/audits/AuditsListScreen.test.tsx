import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { AuditsListScreen } from "./AuditsListScreen";
import { AUDITS, ORGS, USERS } from "@/lib/fixtures";

// CreateAuditModal imports the create Server Action + useRouter — mock both for jsdom.
vi.mock("@/lib/actions/audits", () => ({ createAudit: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

const orgsById = Object.fromEntries(ORGS.map((o) => [o.id, o]));
const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));
const eligibleUsers = USERS.filter((u) => ["chief", "lead", "t1"].includes(u.role));

function renderScreen(canCreate = true) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <AuditsListScreen
        audits={AUDITS}
        orgsById={orgsById}
        usersById={usersById}
        orgs={ORGS}
        eligibleUsers={eligibleUsers}
        canCreate={canCreate}
      />
    </NextIntlClientProvider>,
  );
}

describe("AuditsListScreen", () => {
  it("lists audits with a link to the detail route", () => {
    renderScreen();
    expect(screen.getByRole("heading", { name: "Auditlar" })).toBeInTheDocument();
    const link = screen.getByRole("link", {
      name: "Aloqa va kommunikatsiya vazirligi — yillik kompleks audit",
    });
    expect(link).toHaveAttribute("href", "/audits/AUD-2026-014");
  });

  it("filters rows when a status tab is selected", async () => {
    renderScreen();
    await userEvent.click(screen.getByRole("tab", { name: /Yakunlangan/ }));
    expect(screen.getByRole("link", { name: /pre-prod muhit auditi/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /yillik kompleks audit/ })).toBeNull();
  });

  it("opens the create modal when creation is allowed and hides it otherwise", async () => {
    const { rerender } = renderScreen(true);
    await userEvent.click(screen.getByRole("button", { name: /Yangi audit/ }));
    expect(screen.getByText(/Yangi audit yaratish/)).toBeInTheDocument();

    rerender(
      <NextIntlClientProvider locale="uz" messages={messages}>
        <AuditsListScreen
          audits={AUDITS}
          orgsById={orgsById}
          usersById={usersById}
          orgs={ORGS}
          eligibleUsers={eligibleUsers}
          canCreate={false}
        />
      </NextIntlClientProvider>,
    );
    expect(screen.queryByRole("button", { name: /Yangi audit/ })).toBeNull();
  });
});
