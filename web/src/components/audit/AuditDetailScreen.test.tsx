import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { AuditDetailScreen } from "./AuditDetailScreen";
import { AUDITS, USERS, KPI_USERS, TASKS, TOKENS, REPORTS } from "@/lib/fixtures";

// Tabs pull in Server Actions (server-only chain). Mock so jsdom doesn't load next-auth.
vi.mock("@/lib/actions/findings", () => ({ findingApproval: vi.fn() }));
vi.mock("@/lib/actions/projects", () => ({
  createAuditProject: vi.fn(async () => ({ ok: true })),
  projectApproval: vi.fn(),
}));
vi.mock("@/lib/actions/audits", () => ({
  addMember: vi.fn(),
  removeMember: vi.fn(),
  promoteLead: vi.fn(),
}));
vi.mock("@/lib/actions/tasks", () => ({ createTask: vi.fn() }));
vi.mock("@/lib/actions/tokens", () => ({ issueToken: vi.fn() }));
vi.mock("@/lib/actions/audit-ai", () => ({ analyzeAudit: vi.fn(async () => ({ ok: false })) }));
vi.mock("@/lib/actions/evidence", () => ({
  addAuditEvidence: vi.fn(async () => ({ ok: true })),
  deleteAuditEvidence: vi.fn(async () => ({ ok: true })),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));

function renderDetail(id: string, role: "super" | "t1" = "super") {
  const audit = AUDITS.find((a) => a.id === id) ?? null;
  const project = audit
    ? {
        id: `p-${audit.id}`,
        auditId: audit.id,
        status: "approved" as const,
        currentApprovalStage: null,
        goal: audit.goal ?? null,
        methodology: audit.methodology ?? null,
        scope: audit.scope,
        tools: audit.tools,
      }
    : null;
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <AuditDetailScreen
        role={role}
        currentUserId="u1"
        audit={audit}
        project={project}
        usersById={usersById}
        allUsers={USERS}
        projectApproval={null}
        kpiUsers={KPI_USERS}
        tasks={TASKS.filter((tk) => tk.auditId === id)}
        canCreateTasks={false}
        evidence={[]}
        canAddEvidence={false}
        tokens={TOKENS.filter((tok) => tok.audit === id)}
        canIssueTokens={false}
        latestAuditAi={null}
        reports={REPORTS.filter((r) => r.audit === id)}
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
    expect(screen.getAllByText("Bobur Mirzayev").length).toBeGreaterThan(0);
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
    await userEvent.click(screen.getByRole("tab", { name: /Audit log/ }));
    expect(screen.getByText(/keyingi bosqichda tayyor/)).toBeInTheDocument();
  });

  it("shows a not-found state for an unknown audit", () => {
    renderDetail("nope");
    expect(screen.getByRole("heading", { name: "Audit topilmadi" })).toBeInTheDocument();
  });

  it("disables task-related tabs for a project_pending audit", () => {
    renderDetail("AUD-2026-015");
    const lockedMsg = (messages.auditDetail as Record<string, string>).tabLocked;
    expect(screen.getByRole("tab", { name: /Vazifalar/ })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /Vazifalar/ })).toHaveAttribute("title", lockedMsg);
    expect(screen.getByRole("tab", { name: /Findinglar/ })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /Tokenlar/ })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /KPI/ })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /AI tahlil/ })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /Fayllar/ })).toBeDisabled();
    expect(screen.getByRole("tab", { name: /Hisobotlar/ })).toBeDisabled();
  });

  it("does not disable task-related tabs for an in_progress audit", () => {
    renderDetail("AUD-2026-014");
    expect(screen.getByRole("tab", { name: /Vazifalar/ })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /Findinglar/ })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /Tokenlar/ })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /Fayllar/ })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /AI tahlil/ })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /KPI/ })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /Hisobotlar/ })).not.toBeDisabled();
  });

  it("never disables overview, group, project, log tabs regardless of status", () => {
    renderDetail("AUD-2026-015");
    expect(screen.getByRole("tab", { name: /Umumiy/ })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /Audit guruhi/ })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /Audit loyihasi/ })).not.toBeDisabled();
    expect(screen.getByRole("tab", { name: /Audit log/ })).not.toBeDisabled();
  });
});
