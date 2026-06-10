import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { TasksTab } from "./TasksTab";
import { AUDITS, TASKS, USERS } from "@/lib/fixtures";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/lib/actions/tasks", () => ({ createTask: vi.fn(async () => ({ ok: true, id: "T-999" })) }));

const audit = AUDITS.find((a) => a.id === "AUD-2026-014")!;
const tasks = TASKS.filter((t) => t.auditId === audit.id);
const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));

function renderTab(canCreate = false, taskList = tasks) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <TasksTab audit={audit} tasks={taskList} usersById={usersById} canCreate={canCreate} />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe("TasksTab", () => {
  it("renders a row per task with a link to the task detail", () => {
    renderTab();
    expect(tasks.length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: tasks[0].id })).toHaveAttribute(
      "href",
      `/tasks/${tasks[0].id}`,
    );
    expect(screen.getByRole("link", { name: tasks[0].title })).toHaveAttribute(
      "href",
      `/tasks/${tasks[0].id}`,
    );
  });

  it("filters rows by the search query (title / id)", async () => {
    renderTab();
    const input = screen.getByLabelText(/qidirish/i);
    await userEvent.type(input, "zzz-no-match-zzz");
    expect(screen.getByText("Mos vazifa topilmadi.")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: tasks[0].id })).toBeNull();
  });

  it("filters rows by assignee", async () => {
    renderTab();
    const first = tasks[0];
    // Pick an assignee that is NOT the first task's assignee, so the first row drops out.
    const other = audit.members.find((m) => m !== first.assignee);
    if (other) {
      await userEvent.selectOptions(screen.getByLabelText(/Masʼul boʻyicha/), other);
      expect(screen.queryByRole("link", { name: first.id })).toBeNull();
    }
  });

  it("hides the add button when canCreate is false", () => {
    renderTab(false);
    expect(screen.queryByRole("button", { name: /Yangi vazifa/ })).toBeNull();
  });

  it("shows the add button and opens the create modal when canCreate is true", async () => {
    renderTab(true);
    await userEvent.click(screen.getByRole("button", { name: /Yangi vazifa/ }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("shows the empty state when the audit has no tasks", () => {
    renderTab(false, []);
    expect(screen.getByText("Bu auditda hali vazifa yoʻq.")).toBeInTheDocument();
  });
});
