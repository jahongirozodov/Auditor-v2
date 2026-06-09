import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { AuditDetailScreen } from "./AuditDetailScreen";
import { AUDITS, USERS, KPI_USERS } from "@/lib/fixtures";

// Tabs pull in Server Actions (server-only chain). Mock so jsdom doesn't load next-auth.
vi.mock("@/lib/actions/findings", () => ({ findingApproval: vi.fn() }));
vi.mock("@/lib/actions/projects", () => ({ projectApproval: vi.fn() }));
vi.mock("@/lib/actions/audits", () => ({
  addMember: vi.fn(),
  removeMember: vi.fn(),
  promoteLead: vi.fn(),
  startProjectDraft: vi.fn(),
}));

const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));

function renderDetail(id: string, role: "super" | "t1" = "super") {
  const audit = AUDITS.find((a) => a.id === id) ?? null;
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <AuditDetailScreen
        role={role}
        audit={audit}
        usersById={usersById}
        allUsers={USERS}
        projectApproval={null}
        kpiUsers={KPI_USERS}
      />
    </NextIntlClientProvider>,
  );
}

describe("AuditDetailScreen", () => {
  it("renders the audit title, tabs and the overview by default", () => {
    renderDetail("AUD-2026-014");
    expect(screen.getByRole("heading", { name: /yillik kompleks audit/ })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Umumiy/ })).toHaveClass("is-active");
    // overview workflow timeline present
    expect(screen.getByText("Audit jarayoni — 10 bosqich")).toBeInTheDocument();
  });

  it("opens the Group tab with member rows", async () => {
    renderDetail("AUD-2026-014");
    await userEvent.click(screen.getByRole("tab", { name: /Audit guruhi/ }));
    expect(screen.getByText("Bobur Mirzayev")).toBeInTheDocument();
  });

  it("opens the Project tab with the approval flow", async () => {
    renderDetail("AUD-2026-014");
    await userEvent.click(screen.getByRole("tab", { name: /Audit loyihasi/ }));
    expect(screen.getByText("3-bosqichli tasdiqlash")).toBeInTheDocument();
  });

  it("opens the Tasks tab with audit tasks", async () => {
    renderDetail("AUD-2026-014");
    await userEvent.click(screen.getByRole("tab", { name: /Vazifalar/ }));
    expect(screen.getByRole("link", { name: "T-114" })).toHaveAttribute("href", "/tasks/T-114");
  });

  it("opens the Findings tab and a finding drawer", async () => {
    renderDetail("AUD-2026-014");
    await userEvent.click(screen.getByRole("tab", { name: /Findinglar/ }));
    await userEvent.click(screen.getByText("Login forma — SQL injection (POST /api/v1/login)"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("renders tokens, KPI and reports tabs", async () => {
    renderDetail("AUD-2026-014");
    await userEvent.click(screen.getByRole("tab", { name: /Tokenlar/ }));
    expect(screen.getByText("DESKTOP-MS-NB14")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: "KPI" }));
    expect(screen.getByText("287")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("tab", { name: /Hisobotlar/ }));
    expect(screen.getByText(/Executive Summary/)).toBeInTheDocument();
  });

  it("switches to a not-yet-built tab placeholder", async () => {
    renderDetail("AUD-2026-014");
    await userEvent.click(screen.getByRole("tab", { name: /AI tahlil/ }));
    expect(screen.getByText(/keyingi bosqichda tayyor/)).toBeInTheDocument();
  });

  it("shows a not-found state for an unknown audit", () => {
    renderDetail("nope");
    expect(screen.getByRole("heading", { name: "Audit topilmadi" })).toBeInTheDocument();
  });
});
