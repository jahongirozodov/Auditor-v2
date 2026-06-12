import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { DashboardScreen } from "./DashboardScreen";
import { AUDITS, FINDINGS, KPI_USERS, ORGS, USERS } from "@/lib/fixtures";
import type { RoleCode } from "@/lib/types/roles";

const orgsById = Object.fromEntries(ORGS.map((o) => [o.id, o]));
const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));

function renderDash(role: RoleCode, name = "Akmal Yoʻldoshev") {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <DashboardScreen
        role={role}
        name={name}
        audits={AUDITS}
        findings={FINDINGS}
        kpiUsers={KPI_USERS}
        orgsById={orgsById}
        usersById={usersById}
        userId="u-test"
        myTasks={[]}
        teamTasks={[]}
        scopedFindings={[]}
      />
    </NextIntlClientProvider>,
  );
}

describe("DashboardScreen", () => {
  it("greets the user by first name", () => {
    renderDash("super");
    expect(screen.getByRole("heading", { name: /Yaxshi kun, Akmal/ })).toBeInTheDocument();
  });

  it("shows the hero band for leaders (super/head)", () => {
    const { container } = renderDash("head", "Dilshoda Rasulova");
    expect(container.querySelector(".hero-band")).not.toBeNull();
  });

  it("hides the hero band for non-leaders", () => {
    const { container } = renderDash("t1", "Madina Sodiqova");
    expect(container.querySelector(".hero-band")).toBeNull();
  });

  it("renders stat tiles, the severity donut and the KPI podium", () => {
    const { container } = renderDash("super");
    expect(screen.getAllByText("Faol auditlar").length).toBeGreaterThan(0);
    expect(container.querySelector("svg.donut")).not.toBeNull();
    expect(container.querySelector(".podium")).not.toBeNull();
  });
});
