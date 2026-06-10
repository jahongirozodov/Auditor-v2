import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReportsScreen } from "./ReportsScreen";
import type { Report, Audit } from "@/lib/types/entities";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string, p?: Record<string, unknown>) =>
    p ? `${ns}.${key}(${JSON.stringify(p)})` : `${ns}.${key}`,
}));
vi.mock("@/lib/actions/reports", () => ({
  deleteReport:    vi.fn().mockResolvedValue({ ok: true }),
  generateReport:  vi.fn().mockResolvedValue({ ok: true }),
  REPORT_TYPES:    ["Audit hisoboti"],
  REPORT_FORMATS:  ["PDF", "DOCX"],
}));
vi.mock("@/components/ui/Toast", () => ({ useToast: () => vi.fn() }));
vi.mock("./ReportGenerateModal", () => ({
  ReportGenerateModal: ({ open }: { open: boolean }) =>
    open ? <div data-testid="generate-modal" /> : null,
}));

const AUDITS: Audit[] = [
  { id: "aud-1", code: "AUD-001", title: "Test audit", org: "", type: "", status: "in_progress",
    stage: 3, startDate: "", endDate: "", progress: 0, leader: "", members: [],
    findings: { critical:0,high:0,medium:0,low:0 },
    tasks: { total:1,done:0,in_progress:1,blocked:0,new:0 }, lastSync: "", scope: [], tools: [] },
];

const REPORTS: Report[] = [
  { id: "R-1", title: "Yakuniy hisobot", audit: "AUD-001", type: "Audit hisoboti",
    status: "draft", generated: "—", size: "—", format: ["PDF", "DOCX"], author: "u1" },
  { id: "R-2", title: "Executive summary", audit: "AUD-001", type: "Executive summary",
    status: "approved", generated: "2026-05-18 14:21", size: "4.2 MB", format: ["PDF"], author: "u2" },
];

const USERS = {
  u1: { name: "Akmal Y", avatar: "AY" },
  u2: { name: "Dilshoda R", avatar: "DR" },
};

function setup(reports = REPORTS) {
  return render(<ReportsScreen reports={reports} audits={AUDITS} usersById={USERS} />);
}

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
    expect(screen.getByText("Qoralama")).toBeInTheDocument();
    expect(screen.getByText("Tasdiqlangan")).toBeInTheDocument();
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
});
