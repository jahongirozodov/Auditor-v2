import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { EditProjectModal } from "./EditProjectModal";
import { editProject } from "@/lib/actions/projects";
import { AUDITS } from "@/lib/fixtures";

vi.mock("@/lib/actions/projects", () => ({ editProject: vi.fn(async () => ({ ok: true })) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const m = messages.auditDetail;
const audit = AUDITS[0]; // AUD-2026-014, has goal/scope/tools

function renderModal(onClose = vi.fn()) {
  render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <EditProjectModal open onClose={onClose} audit={audit} />
    </NextIntlClientProvider>,
  );
  return onClose;
}

describe("EditProjectModal", () => {
  it("renders pre-filled from the audit", () => {
    renderModal();
    expect(screen.getByText(m.editProject)).toBeInTheDocument();
    expect(screen.getByLabelText(m.fGoal)).toHaveValue(audit.goal);
    // scope textarea is the audit's scope joined by newlines
    expect(screen.getByLabelText(m.fScope)).toHaveValue(audit.scope.join("\n"));
  });

  it("submits the edited content (scope textarea → array)", async () => {
    renderModal();
    await userEvent.click(screen.getByRole("button", { name: m.save }));
    expect(editProject).toHaveBeenCalledWith(
      expect.objectContaining({
        auditId: audit.id,
        scope: audit.scope,
        tools: audit.tools,
      }),
    );
  });

  it("cancel calls onClose", async () => {
    const onClose = renderModal();
    await userEvent.click(screen.getByRole("button", { name: m.cancel }));
    expect(onClose).toHaveBeenCalled();
  });
});
