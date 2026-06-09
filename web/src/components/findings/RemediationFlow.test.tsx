import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { RemediationFlow } from "./RemediationFlow";
import type { FindingStatus } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

const m = messages.findings;

function renderFlow(
  status: FindingStatus,
  role: RoleCode,
  isAssignee: boolean,
  onAction = vi.fn(),
) {
  render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <RemediationFlow
        status={status}
        role={role}
        isAssignee={isAssignee}
        timeline={[]}
        usersById={{}}
        onAction={onAction}
      />
    </NextIntlClientProvider>,
  );
  return onAction;
}

describe("RemediationFlow", () => {
  it("shows the start-fixing button to the assignee on an approved finding", () => {
    renderFlow("approved", "t1", true);
    expect(screen.getByRole("button", { name: m.remStart })).toBeInTheDocument();
  });

  it("shows no action to a non-assignee t1", () => {
    renderFlow("approved", "t1", false);
    expect(screen.queryByRole("button", { name: m.remStart })).not.toBeInTheDocument();
  });

  it("offers pass + fail at retest, and fail reveals the comment box", async () => {
    renderFlow("retest", "lead", false);
    expect(screen.getByRole("button", { name: m.remPass })).toBeInTheDocument();
    const fail = screen.getByRole("button", { name: m.remFail });
    await userEvent.click(fail);
    expect(screen.getByLabelText(m.remReason)).toBeInTheDocument();
  });

  it("calls onAction when a primary action is clicked", async () => {
    const onAction = renderFlow("retest", "lead", false);
    await userEvent.click(screen.getByRole("button", { name: m.remPass }));
    expect(onAction).toHaveBeenCalledWith("passRetest");
  });

  it("shows no buttons on a closed finding", () => {
    renderFlow("closed", "lead", false);
    expect(screen.queryByRole("button", { name: m.remStart })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: m.remPass })).not.toBeInTheDocument();
  });
});
