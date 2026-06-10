import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { Project } from "./Project";
import { AUDITS } from "@/lib/fixtures";
import type { Audit, AuditProject } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

// Project imports projectApproval + EditProjectModal (→ editProject, useRouter) — mock for jsdom.
vi.mock("@/lib/actions/projects", () => ({
  createAuditProject: vi.fn(async () => ({ ok: true })),
  projectApproval: vi.fn(async () => ({ ok: true })),
  editProject: vi.fn(async () => ({ ok: true })),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const m = messages.auditDetail;
const base = AUDITS[0]; // AUD-2026-014 (in_progress) with goal/scope/tools
const draft: Audit = { ...base, status: "project_draft" };

function projectOf(a: Audit, status: AuditProject["status"] = "approved"): AuditProject {
  return {
    id: `p-${a.id}`,
    auditId: a.id,
    status,
    currentApprovalStage: status === "submitted" ? "head" : null,
    goal: a.goal ?? null,
    methodology: a.methodology ?? null,
    scope: a.scope,
    tools: a.tools,
  };
}

function renderProject(
  a: Audit,
  role: RoleCode,
  project: AuditProject | null = projectOf(a),
  currentUserId = "u1",
) {
  render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <Project a={a} role={role} currentUserId={currentUserId} project={project} approval={null} />
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
    renderProject(draft, "chief", projectOf(draft, "draft"), draft.leader);
    expect(screen.getByRole("button", { name: m.editProject })).toBeInTheDocument();
  });

  it("hides the edit button from a t1", () => {
    renderProject(draft, "t1", projectOf(draft, "draft"), "u9");
    expect(screen.queryByRole("button", { name: m.editProject })).not.toBeInTheDocument();
  });

  it("shows create CTA when project is missing and the leader is authorized", () => {
    const forming = { ...draft, status: "group_forming" as const };
    renderProject(forming, "chief", null, forming.leader);
    expect(screen.getByRole("button", { name: m.createProject })).toBeInTheDocument();
  });
});
