import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { TaskDetailScreen } from "./TaskDetailScreen";
import { AUDITS, FINDINGS, TASKS, USERS } from "@/lib/fixtures";
import type { RoleCode } from "@/lib/types/roles";

vi.mock("@/lib/actions/tasks", () => ({
  taskTransition: vi.fn(async () => ({ ok: true })),
  reassignTask: vi.fn(async () => ({ ok: true })),
}));

const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));

function renderTask(id: string, role: RoleCode = "super") {
  const task = TASKS.find((x) => x.id === id) ?? null;
  const audit = task ? AUDITS.find((a) => a.id === task.auditId) : undefined;
  const linkedFindings = task ? FINDINGS.filter((f) => f.taskId === id) : [];
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <TaskDetailScreen
        task={task}
        audit={audit}
        usersById={usersById}
        history={[]}
        linkedFindings={linkedFindings}
        userId="u1"
        role={role}
      />
    </NextIntlClientProvider>,
  );
}

describe("TaskDetailScreen", () => {
  it("renders the task, status flow and linked findings", () => {
    renderTask("T-114");
    expect(screen.getByRole("heading", { name: /Firewall qoidalari/ })).toBeInTheDocument();
    expect(screen.getByText("Jarayonda")).toBeInTheDocument();
    expect(
      screen.getByText("Internal segment 10.0.0.0/8 ga toʻliq ruxsat berilgan"),
    ).toBeInTheDocument();
  });

  it("enables the reassign select and links to the audit", () => {
    renderTask("T-114");
    expect(screen.getByLabelText(/Qayta biriktirish/)).not.toBeDisabled();
    expect(screen.getByRole("link", { name: "AUD-2026-014" })).toHaveAttribute(
      "href",
      "/audits/AUD-2026-014",
    );
  });

  it("shows a not-found state for an unknown task", () => {
    renderTask("nope");
    expect(screen.getByRole("heading", { name: "Vazifa topilmadi" })).toBeInTheDocument();
  });
});
