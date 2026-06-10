import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportsScreen } from "./ReportsScreen";
import { regenerateReportSummary, reportApproval } from "@/lib/actions/reports";
import type { Report, Audit } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string, p?: Record<string, unknown>) =>
    p ? `${ns}.${key}(${JSON.stringify(p)})` : `${ns}.${key}`,
}));
vi.mock("@/lib/actions/reports", () => ({
  deleteReport: vi.fn().mockResolvedValue({ ok: true }),
  generateReport: vi.fn().mockResolvedValue({ ok: true }),
  regenerateReportSummary: vi.fn().mockResolvedValue({ ok: true }),
  reportApproval: vi.fn().mockResolvedValue({ ok: true }),
  REPORT_TYPES: ["Audit hisoboti"],
  REPORT_FORMATS: ["PDF", "DOCX"],
}));
vi.mock("@/components/ui/Toast", () => ({ useToast: () => vi.fn() }));
vi.mock("./ReportGenerateModal", () => ({
  ReportGenerateModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="generate-modal" /> : null,
}));

const AUDITS: Audit[] = [
  {
    id: "aud-1",
    code: "AUD-001",
    title: "Test audit",
    org: "",
    type: "",
    status: "in_progress",
    stage: 3,
    startDate: "",
    endDate: "",
    progress: 0,
    leader: "",
    members: [],
    findings: { critical: 0, high: 0, medium: 0, low: 0 },
    tasks: { total: 1, done: 0, in_progress: 1, blocked: 0, new: 0 },
    lastSync: "",
    scope: [],
    tools: [],
  },
];

const REPORTS: Report[] = [
  {
    id: "R-1",
    title: "Yakuniy hisobot",
    audit: "AUD-001",
    type: "Audit hisoboti",
    status: "draft",
    generated: "—",
    size: "—",
    format: ["PDF", "DOCX"],
    author: "u1",
    approvalStage: null,
    summary: null,
  },
  {
    id: "R-2",
    title: "Executive summary",
    audit: "AUD-001",
    type: "Boshqaruv xulosasi",
    status: "approved",
    generated: "2026-05-18 14:21",
    size: "4.2 MB",
    format: ["PDF"],
    author: "u2",
    approvalStage: null,
    summary: null,
  },
];

const USERS = {
  u1: { name: "Akmal Y", avatar: "AY" },
  u2: { name: "Dilshoda R", avatar: "DR" },
};

function setup(reports = REPORTS, role: RoleCode = "head", currentUserId = "u1") {
  return render(
    <ReportsScreen
      reports={reports}
      audits={AUDITS}
      usersById={USERS}
      role={role}
      currentUserId={currentUserId}
    />,
  );
}

const REVIEW_REPORT: Report = {
  ...REPORTS[0],
  id: "R-3",
  status: "review",
  approvalStage: "group_lead",
};

describe("ReportsScreen", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders page title", () => {
    setup();
    expect(screen.getByText("reports.title")).toBeInTheDocument();
  });

  it("renders report cards", () => {
    setup();
    expect(screen.getByText("Yakuniy hisobot")).toBeInTheDocument();
    expect(screen.getByText("Executive summary")).toBeInTheDocument();
  });

  it("shows format tags", () => {
    setup();
    expect(screen.getAllByText("PDF").length).toBeGreaterThan(0);
    expect(screen.getByText("DOCX")).toBeInTheDocument();
  });

  it("shows status labels", () => {
    setup();
    expect(screen.getByText("reports.statusDraft")).toBeInTheDocument();
    expect(screen.getByText("reports.statusApproved")).toBeInTheDocument();
  });

  it("shows notGenerated for dash", () => {
    setup();
    expect(screen.getByText("reports.notGenerated")).toBeInTheDocument();
  });

  it("filters by search query", async () => {
    setup();
    const input = screen.getByPlaceholderText("reports.searchPlaceholder");
    await userEvent.type(input, "Executive");
    expect(screen.queryByText("Yakuniy hisobot")).toBeNull();
    expect(screen.getByText("Executive summary")).toBeInTheDocument();
  });

  it("shows empty state when no results", async () => {
    setup();
    const input = screen.getByPlaceholderText("reports.searchPlaceholder");
    await userEvent.type(input, "xxxxxxxxxxx");
    expect(screen.getByText("reports.empty")).toBeInTheDocument();
  });

  it("opens generate modal on button click", async () => {
    setup();
    await userEvent.click(screen.getByText("reports.generate"));
    expect(screen.getByTestId("generate-modal")).toBeInTheDocument();
  });

  it("shows empty state with no reports", () => {
    setup([]);
    expect(screen.getByText("reports.empty")).toBeInTheDocument();
  });

  it("triggers AI summary regeneration on the sparkles button", async () => {
    setup([REPORTS[0]]);
    await userEvent.click(screen.getByTitle("reports.aiRegenerate"));
    expect(regenerateReportSummary).toHaveBeenCalledWith("R-1");
  });

  it("opens the print route on download", async () => {
    const open = vi.spyOn(window, "open").mockReturnValue(null);
    setup([REPORTS[0]]);
    await userEvent.click(screen.getByTitle("reports.download"));
    expect(open).toHaveBeenCalledWith("/print/reports/R-1", "_blank", "noopener");
    open.mockRestore();
  });

  it("shows a submit button on a draft for an eligible role", async () => {
    setup([REPORTS[0]], "head");
    await userEvent.click(screen.getByText("reports.submit"));
    expect(reportApproval).toHaveBeenCalledWith({
      reportId: "R-1",
      action: "submit",
      comment: undefined,
    });
  });

  it("hides approval controls for a role without rights on a review report", () => {
    setup([REVIEW_REPORT], "t1", "u9");
    expect(screen.queryByText("reports.approve")).toBeNull();
    expect(screen.queryByText("reports.submit")).toBeNull();
  });

  it("shows approve/return on a review report for an eligible approver", async () => {
    setup([REVIEW_REPORT], "head");
    await userEvent.click(screen.getByText("reports.approve"));
    expect(reportApproval).toHaveBeenCalledWith({
      reportId: "R-3",
      action: "approve",
      comment: undefined,
    });
  });
});
