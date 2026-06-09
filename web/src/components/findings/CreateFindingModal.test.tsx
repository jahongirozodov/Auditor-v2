import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { CreateFindingModal } from "./CreateFindingModal";
import { createFinding } from "@/lib/actions/findings";
import { AUDITS, TASKS } from "@/lib/fixtures";

vi.mock("@/lib/actions/findings", () => ({
  createFinding: vi.fn(async () => ({ ok: true, id: "F-2026-0351" })),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const m = messages.findings;
const AUDIT_ID = "AUD-2026-014"; // owns T-114..T-125

function renderModal(onClose = vi.fn()) {
  render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <CreateFindingModal
        open
        onClose={onClose}
        audits={AUDITS}
        tasks={TASKS}
        defaultAuditId={AUDIT_ID}
      />
    </NextIntlClientProvider>,
  );
  return onClose;
}

describe("CreateFindingModal", () => {
  it("renders the form and disables create until valid", () => {
    renderModal();
    expect(screen.getByText(m.createTitle)).toBeInTheDocument();
    expect(screen.getByLabelText(m.fName)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: m.create })).toBeDisabled();
  });

  it("lists the selected audit's tasks and auto-fills CVSS from severity", async () => {
    renderModal();
    expect(
      within(screen.getByLabelText(m.fTask)).getByRole("option", { name: /T-114/ }),
    ).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText(m.fSeverity), "critical");
    expect(screen.getByLabelText(m.fCvss)).toHaveValue(9.1);
  });

  it("submits create and calls the action", async () => {
    renderModal();
    await userEvent.type(screen.getByLabelText(m.fName), "Login forma — SQL injection");
    const create = screen.getByRole("button", { name: m.create });
    expect(create).toBeEnabled();
    await userEvent.click(create);
    expect(createFinding).toHaveBeenCalledWith(
      expect.objectContaining({ auditId: AUDIT_ID, taskId: "T-114" }),
    );
  });

  it("cancel calls onClose", async () => {
    const onClose = renderModal();
    await userEvent.click(screen.getByRole("button", { name: m.cancel }));
    expect(onClose).toHaveBeenCalled();
  });
});
