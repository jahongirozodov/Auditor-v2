import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { KpiScreen } from "./KpiScreen";
import { KPI_USERS, KPI_RULES, USERS } from "@/lib/fixtures";

const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));

function renderKpi(canViewAll: boolean) {
  const displayUsers = canViewAll ? KPI_USERS : KPI_USERS.slice(0, 1);
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <KpiScreen
        users={KPI_USERS}
        displayUsers={displayUsers}
        usersById={usersById}
        rules={KPI_RULES}
        canViewAll={canViewAll}
      />
    </NextIntlClientProvider>,
  );
}

describe("KpiScreen", () => {
  it("renders page heading", () => {
    renderKpi(true);
    // "KPI reytingi" appears in both the breadcrumb tail and the h1 — target the heading.
    expect(screen.getByRole("heading", { name: "KPI reytingi" })).toBeInTheDocument();
  });

  it("renders leaderboard section heading", () => {
    renderKpi(true);
    expect(screen.getByText("Mutaxassislar reytingi")).toBeInTheDocument();
  });

  it("renders rules card heading", () => {
    renderKpi(true);
    expect(screen.getByText("KPI qoidalari")).toBeInTheDocument();
  });

  it("renders at least one leaderboard row (user name visible)", () => {
    renderKpi(true);
    const firstUser = usersById[KPI_USERS[0].user];
    expect(screen.getByText(firstUser.name)).toBeInTheDocument();
  });

  it("renders rules with point labels", () => {
    renderKpi(true);
    // First rule has highest points (sorted desc from DB); fixture also sorted desc.
    const firstRule = [...KPI_RULES].sort((a, b) => b.points - a.points)[0];
    expect(screen.getByText(firstRule.label)).toBeInTheDocument();
  });

  it("shows ownOnly banner when canViewAll=false", () => {
    renderKpi(false);
    expect(screen.getByText("Faqat oʻz reytingingiz koʻrsatilmoqda")).toBeInTheDocument();
  });

  it("hides ownOnly banner when canViewAll=true", () => {
    renderKpi(true);
    expect(screen.queryByText("Faqat oʻz reytingingiz koʻrsatilmoqda")).not.toBeInTheDocument();
  });
});
