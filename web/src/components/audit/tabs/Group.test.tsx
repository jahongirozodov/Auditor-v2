import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("candidates panel shows eligible users (chief/lead/t1) not in the team", () => {
    // audit with only u3 in team — u4(lead), u5(lead), u6(t1), u7(t1) are candidates
    const base = AUDITS.find((a) => a.id === "AUD-2026-014")!;
    renderGroup({ ...base, members: ["u3"], leader: "u3" }, "super");
    expect(screen.getByText("Sevara Karimova")).toBeInTheDocument();
    expect(screen.getByText("Otabek Joʻrayev")).toBeInTheDocument();
    // super (u1) is NOT eligible → must NOT appear in candidates
    expect(screen.queryByText("Akmal Yoʻldoshev")).not.toBeInTheDocument();
  });

  it("search filters candidates by name (case-insensitive)", () => {
    const base = AUDITS.find((a) => a.id === "AUD-2026-014")!;
    renderGroup({ ...base, members: ["u3"], leader: "u3" }, "super");
    const searchInput = screen.getByPlaceholderText(messages.auditDetail.groupSearch);
    fireEvent.change(searchInput, { target: { value: "sevara" } });
    expect(screen.getByText("Sevara Karimova")).toBeInTheDocument();
    expect(screen.queryByText("Otabek Joʻrayev")).not.toBeInTheDocument();
  });

  it("shows no-results message when search matches nobody", () => {
    const base = AUDITS.find((a) => a.id === "AUD-2026-014")!;
    renderGroup({ ...base, members: ["u3"], leader: "u3" }, "super");
    const searchInput = screen.getByPlaceholderText(messages.auditDetail.groupSearch);
    fireEvent.change(searchInput, { target: { value: "xxxxxxxxxx" } });
    expect(screen.getByText(messages.auditDetail.groupNoResults)).toBeInTheDocument();
  });

  it("shows noCandidates message when all eligible users are in the team", () => {
    const base = AUDITS.find((a) => a.id === "AUD-2026-014")!;
    // Put ALL eligible users (chief+lead+t1) into the team
    const allEligibleIds = USERS.filter((u) =>
      ["chief", "lead", "t1"].includes(u.role),
    ).map((u) => u.id);
    renderGroup({ ...base, members: allEligibleIds, leader: allEligibleIds[0] }, "super");
    expect(screen.getByText(messages.auditDetail.noCandidates)).toBeInTheDocument();
  });

  it("add-member buttons visible when role allows editing (super)", () => {
    const base = AUDITS.find((a) => a.id === "AUD-2026-014")!;
    renderGroup({ ...base, members: ["u3"], leader: "u3" }, "super");
    expect(
      screen.getAllByRole("button", { name: new RegExp(messages.auditDetail.addMember) }).length,
    ).toBeGreaterThan(0);
  });

  it("no add-member buttons when role cannot edit (t1)", () => {
    const base = AUDITS.find((a) => a.id === "AUD-2026-014")!;
    renderGroup({ ...base, members: ["u3"], leader: "u3" }, "t1");
    expect(
      screen.queryByRole("button", { name: new RegExp(messages.auditDetail.addMember) }),
    ).not.toBeInTheDocument();
  });
});
