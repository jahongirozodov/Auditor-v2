import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Files } from "./Files";
import type { Audit, AuditEvidenceView } from "@/lib/types/entities";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, p?: Record<string, unknown>) =>
    p ? `${key}(${JSON.stringify(p)})` : key,
}));
vi.mock("@/components/ui/Toast", () => ({ useToast: () => vi.fn() }));
vi.mock("@/components/ui/Modal", () => ({
  Modal: ({ open, children, footer }: { open: boolean; children: React.ReactNode; footer: React.ReactNode }) =>
    open ? (
      <div data-testid="modal">
        {children}
        {footer}
      </div>
    ) : null,
}));

const addAuditEvidence = vi.fn().mockResolvedValue({ ok: true });
vi.mock("@/lib/actions/evidence", () => ({
  addAuditEvidence: (...a: unknown[]) => addAuditEvidence(...a),
  deleteAuditEvidence: vi.fn().mockResolvedValue({ ok: true }),
}));

const AUDIT = { id: "AUD-1" } as Audit;
const EVIDENCE: AuditEvidenceView[] = [
  {
    id: "e1",
    filename: "fw-rule.png",
    mimeType: "image/png",
    sizeBytes: 1300000,
    comment: "Firewall qoidasi skrinshoti",
    uploadedBy: "u3",
    uploadedByName: "Bobur",
    uploadedByAvatar: "BM",
    createdAt: "2026-05-20T10:00:00.000Z",
  },
];

describe("Files (evidence tab)", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders real evidence with comment + download link", () => {
    render(<Files a={AUDIT} evidence={EVIDENCE} canAdd={false} currentUserId="u9" />);
    expect(screen.getByText("fw-rule.png")).toBeInTheDocument();
    expect(screen.getByText("Firewall qoidasi skrinshoti")).toBeInTheDocument();
    expect(screen.getByText("1.2 MB")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /evDownload/ })).toHaveAttribute(
      "href",
      "/api/evidence/e1",
    );
  });

  it("hides the add button when the user cannot add", () => {
    render(<Files a={AUDIT} evidence={[]} canAdd={false} currentUserId="u9" />);
    expect(screen.queryByText("evAdd")).toBeNull();
    expect(screen.getByText("evEmpty")).toBeInTheDocument();
  });

  it("shows the add button + modal when allowed; submit disabled without file/comment", async () => {
    render(<Files a={AUDIT} evidence={[]} canAdd currentUserId="u9" />);
    await userEvent.click(screen.getByText("evAdd"));
    const modal = screen.getByTestId("modal");
    expect(modal).toBeInTheDocument();
    // Add button inside modal footer is disabled until a comment + file are present.
    const addButtons = screen.getAllByText("evAdd");
    const footerBtn = addButtons[addButtons.length - 1].closest("button")!;
    expect(footerBtn).toBeDisabled();
  });
});
