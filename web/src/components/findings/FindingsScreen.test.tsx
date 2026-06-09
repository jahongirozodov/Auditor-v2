import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { FindingsScreen } from "./FindingsScreen";
import { AUDITS, FINDINGS, TASKS, USERS } from "@/lib/fixtures";
import { APPROVAL_STAGES, currentOf } from "@/lib/approval";

vi.mock("@/lib/actions/findings", () => ({
  findingApproval: vi.fn(async () => ({ ok: true })),
  createFinding: vi.fn(async () => ({ ok: true, id: "F-2026-0351" })),
  findingRemediation: vi.fn(async () => ({ ok: true })),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));
const approvals = Object.fromEntries(
  FINDINGS.map((f) => [
    f.id,
    { stages: APPROVAL_STAGES, timeline: [], current: currentOf(f.status, null) },
  ]),
);

function renderScreen() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <FindingsScreen
        findings={FINDINGS}
        usersById={usersById}
        approvals={approvals}
        remediations={{}}
        audits={AUDITS}
        tasks={TASKS}
        userId="u1"
        role="super"
      />
    </NextIntlClientProvider>,
  );
}

describe("FindingsScreen", () => {
  it("lists findings and opens a drawer with the approval flow on row click", async () => {
    renderScreen();
    expect(screen.getByRole("heading", { name: "Findinglar" })).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();

    await userEvent.click(screen.getByText("Login forma — SQL injection (POST /api/v1/login)"));
    const dialog = screen.getByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("3-bosqichli tasdiqlash")).toBeInTheDocument();
    expect(screen.getByText("Tavsif")).toBeInTheDocument();
  });

  it("closes the drawer on Escape", async () => {
    renderScreen();
    await userEvent.click(screen.getByText("Login forma — SQL injection (POST /api/v1/login)"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("filters by the Critical tab", async () => {
    renderScreen();
    await userEvent.click(screen.getByRole("tab", { name: /Critical/ }));
    expect(screen.queryByText("SMBv1 yoqilgan — 4 ta server")).toBeNull();
    expect(
      screen.getByText("Login forma — SQL injection (POST /api/v1/login)"),
    ).toBeInTheDocument();
  });

  it("opens the create-finding modal", async () => {
    renderScreen();
    await userEvent.click(screen.getByRole("button", { name: messages.findings.newFinding }));
    // The modal's create button ("Yaratish") is unique to the open modal.
    expect(screen.getByRole("button", { name: messages.findings.create })).toBeInTheDocument();
  });
});
