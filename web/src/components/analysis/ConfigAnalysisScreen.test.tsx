import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { ConfigAnalysisScreen } from "./ConfigAnalysisScreen";
import { AUDITS, TASKS } from "@/lib/fixtures";
import type { ConfigUploadView } from "@/lib/types/entities";
import type { ConfigAiAnalysis } from "@/lib/ai/prompts";

const push = vi.fn();
const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push, refresh }) }));

const { uploadConfig, createConfigDrafts, reanalyzeConfig } = vi.hoisted(() => ({
  uploadConfig: vi.fn(),
  createConfigDrafts: vi.fn(),
  reanalyzeConfig: vi.fn(),
}));
vi.mock("@/lib/actions/config", () => ({ uploadConfig, createConfigDrafts, reanalyzeConfig }));

const ASA = `! ASA 9.16(4)
hostname FW-CORE-01
 no security-level
telnet 0.0.0.0 0.0.0.0 inside`;

const latest: ConfigUploadView = {
  id: "cu-1",
  filename: "fw-core-01.cfg",
  vendor: "cisco_asa",
  content: ASA,
  auditId: AUDITS[0].id,
  taskId: TASKS[0].id,
  createdAt: "2026-06-09T00:00:00.000Z",
};

const devices = [
  {
    id: "d1",
    uploadId: "cu-1",
    hostname: "FW-CORE-01",
    vendor: "cisco_asa",
    model: "Cisco ASA",
    firmware: "9.16(4)",
    findings: { critical: 2, high: 1, medium: 0 },
  },
];

const ANALYSIS: ConfigAiAnalysis = {
  device: { vendor: "cisco_asa", hostname: "FW-CORE-01", model: "Cisco ASA", firmware: "9.16(4)" },
  summary: "Ikkita jiddiy kamchilik aniqlandi.",
  overallRisk: "critical",
  gaps: [
    {
      line: 3,
      severity: "critical",
      title: "Xavfsizlik darajasi belgilanmagan",
      description: "Segmentatsiya buzilgan.",
      cwe: "CWE-1188",
      recommendation: "security-level belgilang",
      evidenceLine: "no security-level",
      risk: "Trafik nazoratsiz",
      impact: "Lateral harakat",
    },
    {
      line: 4,
      severity: "high",
      title: "Telnet yoqilgan",
      description: "Ochiq protokol.",
      cwe: "CWE-319",
      recommendation: "SSH ga oʻting",
      evidenceLine: "telnet 0.0.0.0 0.0.0.0 inside",
      risk: "Parol ochiq",
      impact: "MITM",
      command: "no telnet 0.0.0.0 0.0.0.0 inside",
      refs: ["CWE-319"],
    },
  ],
};

function renderScreen(withLatest = true, latestAi: ConfigAiAnalysis | null = null) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <ConfigAnalysisScreen
        audits={AUDITS}
        tasks={TASKS}
        devices={withLatest ? devices : []}
        latest={withLatest ? latest : null}
        latestAi={latestAi}
        uploads={[]}
      />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  uploadConfig.mockResolvedValue({
    ok: true,
    uploadId: "cu-1",
    vendor: "cisco_asa",
    gapCount: 2,
    analysis: ANALYSIS,
  });
  createConfigDrafts.mockResolvedValue({ ok: true, ids: ["F-2026-0001"] });
  reanalyzeConfig.mockResolvedValue({ ok: true, analysis: ANALYSIS });
});

describe("ConfigAnalysisScreen", () => {
  it("renders the header, the three analysis tabs and the upload control", () => {
    const { container } = renderScreen(false);
    expect(screen.getByRole("heading", { name: "Konfiguratsiya tahlili" })).toBeInTheDocument();
    expect(screen.getAllByRole("tab")).toHaveLength(3);
    expect(screen.getByText("Tahlil qilingan qurilmalar")).toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).not.toBeNull();
  });

  it("shows the empty preview when nothing is uploaded yet", () => {
    renderScreen(false);
    expect(
      screen.getByText("Tahlil natijasini koʻrish uchun konfiguratsiya yuklang."),
    ).toBeInTheDocument();
  });

  it("hydrates the device, preview highlights and AI cards from the stored analysis", () => {
    const { container } = renderScreen(true, ANALYSIS);
    expect(screen.getByText("FW-CORE-01")).toBeInTheDocument();
    expect(container.querySelector("pre.code-block")).not.toBeNull();
    expect(container.querySelector(".code-block .hl")).not.toBeNull(); // gap line highlighted
    expect(screen.getByText("AI tahlil natijasi")).toBeInTheDocument();
    expect(screen.getByText("Ikkita jiddiy kamchilik aniqlandi.")).toBeInTheDocument();
    expect(screen.getByText(/Telnet yoqilgan/)).toBeInTheDocument();
    expect(screen.getByText("no telnet 0.0.0.0 0.0.0.0 inside")).toBeInTheDocument();
    expect(screen.getByText("CWE-319")).toBeInTheDocument();
  });

  it("navigates when another tab is clicked", async () => {
    renderScreen(true, ANALYSIS);
    await userEvent.click(screen.getByRole("tab", { name: /Trafik tahlili/ }));
    expect(push).toHaveBeenCalledWith("/analysis/traffic");
  });

  it("creates drafts from the persisted gaps", async () => {
    renderScreen(true, ANALYSIS);
    await userEvent.click(screen.getByRole("button", { name: /finding yaratish/ }));
    expect(createConfigDrafts).toHaveBeenCalledWith({ uploadId: "cu-1" });
  });

  it("renders the structured analysis returned by uploadConfig (AI-driven detection)", async () => {
    const { container } = renderScreen(false);
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File([ASA], "fw-core-01.cfg", { type: "text/plain" });
    await userEvent.upload(input, file);
    await userEvent.click(screen.getByRole("button", { name: "Tahlil qilish" }));
    await waitFor(() => expect(uploadConfig).toHaveBeenCalled());
    expect(await screen.findByText("Ikkita jiddiy kamchilik aniqlandi.")).toBeInTheDocument();
  });

  it("re-runs the analyzer via the reanalyzeConfig server action", async () => {
    renderScreen(true, ANALYSIS);
    await userEvent.click(screen.getByRole("button", { name: /Qayta tahlil/ }));
    await waitFor(() => expect(reanalyzeConfig).toHaveBeenCalledWith({ uploadId: "cu-1" }));
  });

  it("shows the degraded message when re-analysis cannot reach the model", async () => {
    reanalyzeConfig.mockResolvedValue({ ok: false, error: "ai_unavailable" });
    renderScreen(true, ANALYSIS);
    await userEvent.click(screen.getByRole("button", { name: /Qayta tahlil/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/AI xizmatiga ulanib boʻlmadi/);
  });
});
