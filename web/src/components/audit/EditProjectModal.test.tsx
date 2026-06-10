import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { EditProjectModal } from "./EditProjectModal";
import { editProject } from "@/lib/actions/projects";
import { AUDITS } from "@/lib/fixtures";
import type { AuditProject } from "@/lib/types/entities";

vi.mock("@/lib/actions/projects", () => ({ editProject: vi.fn(async () => ({ ok: true })) }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const m = messages.auditDetail;
const audit = AUDITS[0]; // AUD-2026-014, has goal/scope/tools
const project: AuditProject = {
  id: `p-${audit.id}`,
  auditId: audit.id,
  status: "draft",
  currentApprovalStage: null,
  goal: audit.goal ?? null,
  methodology: audit.methodology ?? null,
  scope: audit.scope,
  tools: audit.tools,
};

function renderModal(onClose = vi.fn()) {
  render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <EditProjectModal open onClose={onClose} audit={audit} project={project} />
    </NextIntlClientProvider>,
  );
  return onClose;
}

describe("EditProjectModal", () => {
  it("renders pre-filled from the project", () => {
    renderModal();
    expect(screen.getByText(m.editProject)).toBeInTheDocument();
    expect(screen.getByLabelText(m.fGoal)).toHaveValue(project.goal);
    expect(screen.getByLabelText(m.fScope)).toHaveValue(project.scope.join("\n"));
  });

  it("submits the edited content (scope textarea → array)", async () => {
    renderModal();
    await userEvent.click(screen.getByRole("button", { name: m.save }));
    expect(editProject).toHaveBeenCalledWith(
      expect.objectContaining({
        auditId: audit.id,
        scope: project.scope,
        tools: project.tools,
      }),
    );
  });

  it("cancel calls onClose", async () => {
    const onClose = renderModal();
    await userEvent.click(screen.getByRole("button", { name: m.cancel }));
    expect(onClose).toHaveBeenCalled();
  });
});
