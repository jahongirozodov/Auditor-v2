import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { Project } from "./Project";
import { AUDITS } from "@/lib/fixtures";
import type { Audit } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

// Project imports projectApproval + EditProjectModal (→ editProject, useRouter) — mock for jsdom.
vi.mock("@/lib/actions/projects", () => ({
  projectApproval: vi.fn(async () => ({ ok: true })),
  editProject: vi.fn(async () => ({ ok: true })),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const m = messages.auditDetail;
const base = AUDITS[0]; // AUD-2026-014 (in_progress) with goal/scope/tools
const draft: Audit = { ...base, status: "project_draft" };

function renderProject(a: Audit, role: RoleCode) {
  render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <Project a={a} role={role} approval={null} />
    </NextIntlClientProvider>,
  );
}

describe("Project tab", () => {
  it("renders the persisted goal/scope/tools (not i18n defaults)", () => {
    renderProject(base, "super");
    expect(screen.getByText(base.goal!)).toBeInTheDocument();
    expect(screen.getByText(base.scope[0])).toBeInTheDocument();
    expect(screen.getByText(base.tools[0])).toBeInTheDocument();
    // in_progress is past the editable window → no edit button even for super
    expect(screen.queryByRole("button", { name: m.editProject })).not.toBeInTheDocument();
  });

  it("shows the edit button for a group lead while drafting", () => {
    renderProject(draft, "chief");
    expect(screen.getByRole("button", { name: m.editProject })).toBeInTheDocument();
  });

  it("hides the edit button from a t1", () => {
    renderProject(draft, "t1");
    expect(screen.queryByRole("button", { name: m.editProject })).not.toBeInTheDocument();
  });
});
