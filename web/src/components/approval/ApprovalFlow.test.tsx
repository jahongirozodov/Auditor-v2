import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { ApprovalFlow } from "./ApprovalFlow";
import { PROJECT_APPROVAL, USERS } from "@/lib/fixtures";
import type { ApprovalCurrent } from "@/lib/approval";
import type { RoleCode } from "@/lib/types/roles";

const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));
const noop = vi.fn();

function renderFlow(role: RoleCode, current: ApprovalCurrent = "dept", wired = false) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <ApprovalFlow
        stages={PROJECT_APPROVAL.stages}
        timeline={PROJECT_APPROVAL.timeline}
        current={current}
        role={role}
        usersById={usersById}
        {...(wired ? { onApprove: noop, onReturn: noop } : {})}
      />
    </NextIntlClientProvider>,
  );
}

describe("ApprovalFlow", () => {
  it("renders the 3 stages and the in-progress chip", () => {
    const { container } = renderFlow("super");
    expect(container.querySelectorAll(".apf__node")).toHaveLength(3);
    expect(screen.getByText("Jarayonda")).toBeInTheDocument();
  });

  it("shows enabled action buttons for a role that can act at the dept stage (wired)", () => {
    renderFlow("super", "dept", true);
    const approve = screen.getByRole("button", { name: /Yakuniy tasdiqlash/ });
    expect(approve).toBeEnabled();
    expect(screen.getByRole("button", { name: /Qaytarish/ })).toBeInTheDocument();
  });

  it("hides action buttons when not wired (read-only context)", () => {
    renderFlow("super", "dept", false);
    expect(screen.queryByRole("button", { name: /Yakuniy tasdiqlash/ })).toBeNull();
  });

  it("shows a wait message for a role that cannot act", () => {
    renderFlow("t1", "dept", true);
    expect(screen.queryByRole("button", { name: /tasdiqlash/i })).toBeNull();
    expect(screen.getByText(/Bu bosqichni/)).toBeInTheDocument();
  });

  it("renders the approved state", () => {
    renderFlow("super", null);
    expect(screen.getByText("Tasdiqlangan")).toBeInTheDocument();
    expect(screen.getByText("Barcha bosqichlar yakunlandi.")).toBeInTheDocument();
  });

  it("renders the immutable timeline entries", () => {
    const { container } = renderFlow("head");
    expect(container.querySelectorAll(".apf__tlitem").length).toBe(
      PROJECT_APPROVAL.timeline.length,
    );
  });
});
