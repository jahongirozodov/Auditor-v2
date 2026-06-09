import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { ScannerImportScreen } from "./ScannerImportScreen";
import { AUDITS, TASKS } from "@/lib/fixtures";
import type { ScanImportRowView } from "@/lib/types/entities";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

const { uploadScannerFile } = vi.hoisted(() => ({
  uploadScannerFile: vi.fn(),
}));
vi.mock("@/lib/actions/scanner", () => ({ uploadScannerFile }));

const IMPORTS: ScanImportRowView[] = [
  {
    id: "si-1",
    filename: "scan-result.nessus",
    scanner: "nessus",
    auditCode: "AUD-2026-014",
    severityAgg: { critical: 3, high: 5, medium: 8, low: 2, info: 1 },
    status: "done",
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  },
];

function renderScreen(importsArg: ScanImportRowView[] = []) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <ScannerImportScreen audits={AUDITS} tasks={TASKS} imports={importsArg} />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  uploadScannerFile.mockResolvedValue({ ok: true, uploadId: "si-1", scanner: "nessus", findingCount: 8 });
});

describe("ScannerImportScreen", () => {
  it("renders the header, three tabs, drop zone and hidden file input", () => {
    const { container } = renderScreen();
    expect(screen.getByRole("heading", { name: "Skaner importi" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByText("Skaner natijalarini yuklash")).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).not.toBeNull();
  });

  it("shows recentEmpty text when imports is empty", () => {
    renderScreen([]);
    expect(screen.getByText("Hali skaner fayli yuklanmagan.")).toBeInTheDocument();
  });

  it("renders import table rows when imports are provided", () => {
    renderScreen(IMPORTS);
    expect(screen.getByText("scan-result.nessus")).toBeInTheDocument();
    expect(screen.getByText("AUD-2026-014")).toBeInTheDocument();
    expect(screen.getByText("Bajarildi")).toBeInTheDocument();
  });

  it("navigates to traffic tab on tab click", async () => {
    renderScreen();
    await userEvent.click(screen.getByRole("tab", { name: /Trafik tahlili/ }));
    expect(push).toHaveBeenCalledWith("/analysis/traffic");
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
