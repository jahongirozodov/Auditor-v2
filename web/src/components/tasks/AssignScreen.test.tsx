import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
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

function renderScreen(role = "lead" as const) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <AssignScreen audits={AUDITS} tasks={TASKS} usersById={usersById} role={role} />
    </NextIntlClientProvider>,
  );
}

describe("AssignScreen", () => {
  it("renders the audit selector, task table and workload sidebar", () => {
    renderScreen();
    expect(screen.getByRole("heading", { name: "Vazifalarni taqsimlash" })).toBeInTheDocument();
    expect(screen.getByLabelText("Audit:")).toBeInTheDocument();
    // first audit with tasks (AUD-2026-014) → T-114 row
    expect(screen.getByRole("link", { name: "T-114" })).toHaveAttribute("href", "/tasks/T-114");
    expect(screen.getByText("Ish yuki taqsimoti")).toBeInTheDocument();
  });

  it("opens the create modal for a lead", async () => {
    renderScreen();
    await userEvent.click(screen.getByRole("button", { name: messages.assign.newTask }));
    // The modal's submit button ("Yaratish va biriktirish") is unique to the open modal.
    expect(screen.getByRole("button", { name: messages.assign.create })).toBeInTheDocument();
  });

  it("hides the create button for a t1", () => {
    renderScreen("t1" as never);
    expect(screen.queryByRole("button", { name: messages.assign.newTask })).not.toBeInTheDocument();
  });
});
