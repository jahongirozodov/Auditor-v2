import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { ScannerImportScreen } from "./ScannerImportScreen";
import { AUDITS, TASKS } from "@/lib/fixtures";
import type { ScanImportRowView, ScannerUploadView } from "@/lib/types/entities";
import type { ScannerNormalization } from "@/lib/analysis/scanner";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

const { uploadScannerFile, reanalyzeScanner } = vi.hoisted(() => ({
  uploadScannerFile: vi.fn(),
  reanalyzeScanner: vi.fn(),
}));
vi.mock("@/lib/actions/scanner", () => ({
  uploadScannerFile,
  reanalyzeScanner,
}));

const IMPORTS: ScanImportRowView[] = [
  {
    id: "si-1",
    filename: "scan-result.nessus",
    scanner: "nessus",
    auditCode: "AUD-2026-014",
    severityAgg: { critical: 3, high: 5, medium: 8, low: 2, info: 1 },
    status: "analyzed",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
];

const NORM: ScannerNormalization = {
  summary: "Takrorlanuvchilar birlashtirildi.",
  overallRisk: "high",
  originalCount: 12,
  normalizedCount: 5,
  findings: [
    {
      title: "TLS 1.0 yoqilgan",
      description: "Zaif protokol.",
      severity: "high",
      host: "10.0.0.1",
      port: "443",
      cve: ["CVE-2011-3389"],
      remediation: "TLS 1.0 ni oʻchiring",
      mergedCount: 3,
    },
  ],
};

const LATEST: ScannerUploadView = {
  id: "su-1",
  filename: "scan-result.nessus",
  scanner: "nessus",
  content: "<NessusClientData />",
  auditId: AUDITS[0].id,
  taskId: TASKS[0].id,
  status: "analyzed",
  findingCount: 12,
  aiOk: true,
  createdAt: "2026-06-10T00:00:00.000Z",
};

function renderScreen(
  importsArg: ScanImportRowView[] = [],
  latest: ScannerUploadView | null = null,
  latestAi: ScannerNormalization | null = null,
) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <ScannerImportScreen
        audits={AUDITS}
        tasks={TASKS}
        imports={importsArg}
        latest={latest}
        latestAi={latestAi}
      />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  uploadScannerFile.mockResolvedValue({
    ok: true,
    uploadId: "su-1",
    scanner: "nessus",
    findingCount: 12,
    ai: NORM,
    aiOk: true,
  });
  reanalyzeScanner.mockResolvedValue({ ok: true, normalization: NORM });
});

describe("ScannerImportScreen", () => {
  it("renders the header, three tabs, drop zone and hidden file input", () => {
    const { container } = renderScreen();
    expect(screen.getByRole("heading", { name: "Skaner importi" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByText("Skaner natijalarini yuklash")).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).not.toBeNull();
  });

  it("shows the static AI promo when no analysis is present", () => {
    renderScreen();
    expect(screen.getByText("AI normalizatsiya")).toBeInTheDocument();
    expect(screen.getByText(/takrorlanuvchi findinglar bitta yozuvga/)).toBeInTheDocument();
  });

  it("renders import table rows when imports are provided", () => {
    renderScreen(IMPORTS);
    expect(screen.getByText("scan-result.nessus")).toBeInTheDocument();
    expect(screen.getByText("AUD-2026-014")).toBeInTheDocument();
  });

  it("shows 'Bajarildi' tag for analyzed imports", () => {
    renderScreen(IMPORTS);
    expect(screen.getByText("Bajarildi")).toBeInTheDocument();
  });

  it("hydrates the AI normalization panel from latestAi (dedup win + cards)", () => {
    renderScreen([], LATEST, NORM);
    expect(screen.getByText("Takrorlanuvchilar birlashtirildi.")).toBeInTheDocument();
    expect(screen.getByText(/12 ta xom → 5 ta normallashtirilgan/)).toBeInTheDocument();
    expect(screen.getByText("TLS 1.0 yoqilgan")).toBeInTheDocument();
    expect(screen.getByText("CVE-2011-3389")).toBeInTheDocument();
    expect(screen.getByText(/birlashtirildi ×3/)).toBeInTheDocument();
  });

  it("re-runs normalization via the reanalyzeScanner action", async () => {
    renderScreen([], LATEST, NORM);
    await userEvent.click(screen.getByRole("button", { name: /AI normalizatsiya/ }));
    await waitFor(() => expect(reanalyzeScanner).toHaveBeenCalledWith({ uploadId: "su-1" }));
  });

  it("rejects files larger than 10 MB with a toast", async () => {
    renderScreen();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const big = new File(["x"], "big.nessus", { type: "text/plain" });
    Object.defineProperty(big, "size", { value: 10 * 1024 * 1024 + 1 });
    await userEvent.upload(input, big);
    await screen.findByText(/10 MB/);
    expect(uploadScannerFile).not.toHaveBeenCalled();
  });

  it("opens modal with audit and task selects when file is picked", async () => {
    renderScreen();
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["<NessusClientData />"], "scan.nessus", { type: "text/xml" });
    await userEvent.upload(input, file);
    expect(await screen.findByText("Auditga biriktirish")).toBeInTheDocument();
    expect(screen.getByLabelText("Audit")).toBeInTheDocument();
    expect(screen.getByLabelText("Vazifa")).toBeInTheDocument();
  });
});
