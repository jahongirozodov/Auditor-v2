import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { AUDITS, TASKS, USERS } from "@/lib/fixtures";
import { MyTasksScreen } from "./MyTasksScreen";

vi.mock("@/lib/actions/tasks", () => ({
  createTask: vi.fn(async () => ({ ok: true, id: "T-126" })),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));
const u6Tasks = TASKS.filter((task) => task.assignee === "u6");
const creatableAudits = AUDITS.filter((audit) => audit.id === "AUD-2026-014");

function renderScreen({ tasks = u6Tasks, currentUserId = "u6", creatable = creatableAudits } = {}) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <MyTasksScreen
        tasks={tasks}
        usersById={usersById}
        role="chief"
        currentUserId={currentUserId}
        creatableAudits={creatable}
      />
    </NextIntlClientProvider>,
  );
}

describe("MyTasksScreen", () => {
  it("renders prop-driven kanban columns and a current-user task card", () => {
    const { container } = renderScreen();
    expect(screen.getByRole("heading", { name: "Mening vazifalarim" })).toBeInTheDocument();
    expect(container.querySelectorAll(".kanban__col")).toHaveLength(7);
    const card = screen.getByRole("link", { name: /Firewall qoidalari/ });
    expect(card).toHaveClass("k-card");
    expect(card).toHaveAttribute("href", "/tasks/T-114");
  });

  it("does not render tasks that are not assigned to the current user", () => {
    renderScreen({ tasks: TASKS, currentUserId: "u6" });
    expect(screen.getByRole("link", { name: /Firewall qoidalari/ })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /Nessus skaner/ })).not.toBeInTheDocument();
  });

  it("shows empty state when there are no current-user tasks", () => {
    renderScreen({ tasks: [], creatable: [] });
    expect(screen.getByText(messages.tasks.empty)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: messages.tasks.newTask })).not.toBeInTheDocument();
  });

  it("opens create modal when creatable audits exist", async () => {
    renderScreen();
    await userEvent.click(screen.getByRole("button", { name: messages.tasks.newTask }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(messages.assign.fName)).toBeInTheDocument();
    expect(screen.getByLabelText(messages.assign.fAssignee)).toHaveValue("u6");
  });
});
