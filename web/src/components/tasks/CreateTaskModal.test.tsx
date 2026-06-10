import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { CreateTaskModal } from "./CreateTaskModal";
import { createTask } from "@/lib/actions/tasks";
import { AUDITS, USERS } from "@/lib/fixtures";

vi.mock("@/lib/actions/tasks", () => ({
  createTask: vi.fn(async () => ({ ok: true, id: "T-126" })),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const m = messages.assign;
const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));
// AUD-2026-014 members are [u3, u4, u6, u7].
const AUDIT_ID = "AUD-2026-014";

function renderModal(onClose = vi.fn()) {
  render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <CreateTaskModal
        open
        onClose={onClose}
        audits={AUDITS}
        usersById={usersById}
        defaultAuditId={AUDIT_ID}
        defaultAssigneeId="u6"
      />
    </NextIntlClientProvider>,
  );
  return onClose;
}

describe("CreateTaskModal", () => {
  it("renders the form and disables create until valid", () => {
    renderModal();
    expect(screen.getByText(m.createTitle)).toBeInTheDocument();
    expect(screen.getByLabelText(m.fName)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: m.create })).toBeDisabled();
  });

  it("lists the selected audit's members as assignees", () => {
    renderModal();
    const select = screen.getByLabelText(m.fAssignee);
    // u6 is a member of AUD-2026-014.
    const u6 = USERS.find((u) => u.id === "u6")!;
    expect(within(select).getByRole("option", { name: new RegExp(u6.name) })).toBeInTheDocument();
  });

  it("defaults the assignee to the preferred audit member", () => {
    renderModal();
    expect(screen.getByLabelText(m.fAssignee)).toHaveValue("u6");
  });

  it("submits create+assign and calls the action", async () => {
    renderModal();
    await userEvent.type(screen.getByLabelText(m.fName), "Firewall qoidalarini tahlil qilish");
    await userEvent.type(screen.getByLabelText(m.fDue), "2026-06-01");
    await userEvent.selectOptions(screen.getByLabelText(m.fAssignee), "u6");
    const create = screen.getByRole("button", { name: m.create });
    expect(create).toBeEnabled();
    await userEvent.click(create);
    expect(createTask).toHaveBeenCalledWith(
      expect.objectContaining({ auditId: AUDIT_ID, assigneeId: "u6" }),
    );
  });

  it("cancel calls onClose", async () => {
    const onClose = renderModal();
    await userEvent.click(screen.getByRole("button", { name: m.cancel }));
    expect(onClose).toHaveBeenCalled();
  });
});
