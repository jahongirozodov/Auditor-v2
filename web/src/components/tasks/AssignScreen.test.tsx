import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { AssignScreen } from "./AssignScreen";
import { AUDITS, TASKS, USERS } from "@/lib/fixtures";

// CreateTaskModal pulls the "use server" action + useRouter — mock both for jsdom.
vi.mock("@/lib/actions/tasks", () => ({
  createTask: vi.fn(async () => ({ ok: true, id: "T-126" })),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));
const creatableAudits = AUDITS.filter((audit) => audit.id === "AUD-2026-014");

function renderScreen({ creatable = creatableAudits, currentUserId = "u6" } = {}) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <AssignScreen
        audits={AUDITS}
        tasks={TASKS}
        usersById={usersById}
        currentUserId={currentUserId}
        creatableAudits={creatable}
      />
    </NextIntlClientProvider>,
  );
}

function bodyRows() {
  // All tbody rows except a single full-width empty-state row.
  return screen
    .getAllByRole("row")
    .filter((r) => within(r).queryAllByRole("columnheader").length === 0)
    .filter((r) => !within(r).queryByText(messages.assign.empty));
}

describe("AssignScreen", () => {
  it("renders every task with an audit column", () => {
    renderScreen();
    expect(screen.getByRole("heading", { name: "Vazifalarni taqsimlash" })).toBeInTheDocument();
    expect(bodyRows()).toHaveLength(TASKS.length);
    expect(screen.getByRole("link", { name: "T-114" })).toHaveAttribute("href", "/tasks/T-114");
    // Audit column header + spot-check: tasks belonging to AUD-2026-014 render that code.
    expect(screen.getByRole("columnheader", { name: messages.assign.thAudit })).toBeInTheDocument();
    const aud14Count = TASKS.filter((t) => t.auditId === "AUD-2026-014").length;
    expect(screen.getAllByText("AUD-2026-014").length).toBe(aud14Count);
  });

  it("filters by status", async () => {
    renderScreen();
    await userEvent.selectOptions(screen.getByLabelText(messages.assign.filterStatus), "done");
    const doneTasks = TASKS.filter((t) => t.status === "done");
    expect(bodyRows()).toHaveLength(doneTasks.length);
    expect(screen.getByRole("link", { name: "T-116" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "T-114" })).not.toBeInTheDocument();
  });

  it("filters by assignee", async () => {
    renderScreen();
    // u7 (Jasur Tursunov) is assigned tasks across multiple audits.
    await userEvent.selectOptions(screen.getByLabelText(messages.assign.filterAssignee), "u7");
    const u7Tasks = TASKS.filter((t) => t.assignee === "u7");
    expect(bodyRows()).toHaveLength(u7Tasks.length);
    expect(screen.getByRole("link", { name: "T-115" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "T-121" })).toBeInTheDocument();
  });

  it("searches by id and title", async () => {
    renderScreen();
    const q = "firewall";
    const matches = TASKS.filter((t) => `${t.id} ${t.title}`.toLowerCase().includes(q));
    await userEvent.type(screen.getByLabelText(messages.assign.search), q);
    expect(bodyRows()).toHaveLength(matches.length);
    expect(screen.getByRole("link", { name: "T-114" })).toBeInTheDocument();
  });

  it("shows an empty state when nothing matches", async () => {
    renderScreen();
    await userEvent.type(screen.getByLabelText(messages.assign.search), "zzz-no-match");
    expect(bodyRows()).toHaveLength(0);
    expect(screen.getByText(messages.assign.empty)).toBeInTheDocument();
  });

  it("opens the create modal when the user has a creatable audit", async () => {
    renderScreen();
    await userEvent.click(screen.getByRole("button", { name: messages.assign.newTask }));
    // The modal's submit button ("Yaratish va biriktirish") is unique to the open modal.
    expect(screen.getByRole("button", { name: messages.assign.create })).toBeInTheDocument();
  });

  it("hides the create button when the user has no creatable audits", () => {
    renderScreen({ creatable: [] });
    expect(screen.queryByRole("button", { name: messages.assign.newTask })).not.toBeInTheDocument();
  });
});
