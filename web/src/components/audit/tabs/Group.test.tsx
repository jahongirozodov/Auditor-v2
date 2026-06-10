import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { Group } from "./Group";
import { AUDITS, USERS } from "@/lib/fixtures";
import type { Audit } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

vi.mock("@/lib/actions/audits", () => ({
  addMember: vi.fn(),
  removeMember: vi.fn(),
  promoteLead: vi.fn(),
}));

const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));

function renderGroup(audit: Audit, role: RoleCode = "super") {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <Group a={audit} usersById={usersById} allUsers={USERS} role={role} />
    </NextIntlClientProvider>,
  );
}

describe("Group tab", () => {
  it("renders the team, tags the lead, and offers promote on non-leads (manager)", () => {
    const audit = AUDITS.find((a) => a.id === "AUD-2026-014")!;
    renderGroup(audit, "super");
    expect(screen.getAllByText("Guruh rahbari").length).toBeGreaterThan(0);
    // promote button on every non-lead → members - 1
    expect(screen.getAllByRole("button", { name: "Rahbar etib tayinlash" })).toHaveLength(
      audit.members.length - 1,
    );
  });

  it("does not expose project creation from the group tab", () => {
    const base = AUDITS.find((a) => a.id === "AUD-2026-015")!;
    renderGroup({ ...base, status: "group_forming" }, "super");
    expect(
      screen.queryByRole("button", { name: /Loyiha qoralamasini boshlash|Loyiha yaratish/ }),
    ).not.toBeInTheDocument();
  });

  it("hides team-edit controls for a non-manager (t1)", () => {
    const audit = AUDITS.find((a) => a.id === "AUD-2026-014")!;
    renderGroup(audit, "t1");
    expect(screen.queryByRole("button", { name: "Rahbar etib tayinlash" })).toBeNull();
  });
});
