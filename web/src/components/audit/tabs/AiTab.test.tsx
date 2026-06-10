import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { AiTab } from "./AiTab";
import { AUDITS } from "@/lib/fixtures";
import type { AuditAnalysis } from "@/lib/analysis/audit/types";

const { analyzeAudit } = vi.hoisted(() => ({ analyzeAudit: vi.fn() }));
vi.mock("@/lib/actions/audit-ai", () => ({ analyzeAudit }));

const audit = AUDITS[0];

const ANALYSIS: AuditAnalysis = {
  executiveSummary: "Audit yuqori xavfli.",
  overallRisk: "high",
  topRisks: [{ title: "SQL injection", severity: "critical", why: "Ochiq", recommendation: "Parametrlash" }],
  remediationPlan: [{ priority: "high", action: "Patch qiling" }],
  kpiNote: "KPI yaxshi.",
};

function renderTab(latestAi: AuditAnalysis | null = ANALYSIS) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <AiTab audit={audit} latestAi={latestAi} userName="Akmal" orgName="Aloqa" />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  analyzeAudit.mockResolvedValue({ ok: true, analysis: ANALYSIS });
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ json: async () => ({ ok: true, text: "AI javob" }) }),
  );
});

describe("AiTab", () => {
  it("hydrates the structured analysis from latestAi (no auto-run)", () => {
    renderTab(ANALYSIS);
    expect(screen.getByText("Audit yuqori xavfli.")).toBeInTheDocument();
    expect(screen.getByText("SQL injection")).toBeInTheDocument();
    expect(screen.getByText("Patch qiling")).toBeInTheDocument();
    expect(analyzeAudit).not.toHaveBeenCalled();
  });

  it("auto-runs the analysis on load when none is stored", async () => {
    renderTab(null);
    await waitFor(() => expect(analyzeAudit).toHaveBeenCalledWith({ auditId: audit.id }));
    expect(await screen.findByText("Audit yuqori xavfli.")).toBeInTheDocument();
  });

  it("shows the no-data notice (not an Ollama error) for an empty audit", async () => {
    analyzeAudit.mockResolvedValue({ ok: false, error: "no_data" });
    renderTab(null);
    expect(await screen.findByText(/tahlil qiladigan maʼlumot yoʻq/)).toBeInTheDocument();
  });

  it("shows the unreachable notice when the model is down", async () => {
    analyzeAudit.mockResolvedValue({ ok: false, error: "ai_unavailable" });
    renderTab(null);
    expect(await screen.findByText(/Ollama ishga tushgach/)).toBeInTheDocument();
  });

  it("re-runs via the analyzeAudit action on the button", async () => {
    renderTab(ANALYSIS);
    await userEvent.click(screen.getByRole("button", { name: /AI tahlil/ }));
    expect(analyzeAudit).toHaveBeenCalledWith({ auditId: audit.id });
  });

  it("sends a chat message to /api/ai (chat scope)", async () => {
    renderTab(ANALYSIS);
    const box = screen.getByLabelText(/AI ga soʻrov yozing/);
    await userEvent.type(box, "Xulosa ber");
    await userEvent.click(screen.getByRole("button", { name: /Yuborish/ }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url, opts] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/ai");
    expect(JSON.parse((opts as { body: string }).body).scope).toBe("chat");
    expect(await screen.findByText("AI javob")).toBeInTheDocument();
  });
});
