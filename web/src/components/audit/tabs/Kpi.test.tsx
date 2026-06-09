import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { Kpi } from "./Kpi";
import { KPI_USERS, USERS } from "@/lib/fixtures";
import type { Audit } from "@/lib/types/entities";

const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));
// First KPI row that maps to a known user — proves the tab reads DB props, not fixtures internally.
const member = KPI_USERS.find((k) => usersById[k.user])!;

function renderTab(memberIds: string[]) {
  // The tab only reads `a.members`; cast a minimal audit rather than build the full entity.
  const audit = { members: memberIds } as unknown as Audit;
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <Kpi a={audit} kpiUsers={KPI_USERS} usersById={usersById} />
    </NextIntlClientProvider>,
  );
}

describe("audit-detail Kpi tab", () => {
  it("renders a row for a KPI user who is an audit member", () => {
    renderTab([member.user]);
    expect(screen.getByText(usersById[member.user].name)).toBeInTheDocument();
    expect(screen.getByText(String(member.total))).toBeInTheDocument();
  });

  it("filters out KPI users who are not audit members", () => {
    const other = KPI_USERS.find((k) => k.user !== member.user && usersById[k.user]);
    renderTab([member.user]);
    if (other && usersById[other.user].name !== usersById[member.user].name) {
      expect(screen.queryByText(usersById[other.user].name)).not.toBeInTheDocument();
    }
  });
});
