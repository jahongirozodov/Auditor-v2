import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiScreen } from "./AiScreen";
import type { Audit } from "@/lib/types/entities";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string, params?: Record<string, unknown>) =>
    params ? `${ns}.${key}(${JSON.stringify(params)})` : `${ns}.${key}`,
}));
vi.mock("@/components/ui/Toast", () => ({ useToast: () => vi.fn() }));

const { saveExchange, getConversation, listConversations, deleteConversation } = vi.hoisted(() => ({
  saveExchange: vi.fn(async () => ({ ok: true, conversationId: "c1" })),
  getConversation: vi.fn(async () => null),
  listConversations: vi.fn(async () => []),
  deleteConversation: vi.fn(async () => ({ ok: true })),
}));
vi.mock("@/lib/actions/ai-chat", () => ({
  saveExchange,
  getConversation,
  listConversations,
  deleteConversation,
}));
vi.mock("@/lib/actions/audit-ai", () => ({ analyzeAudit: vi.fn(async () => ({ ok: true })) }));

const AUDITS: Audit[] = [
  {
    id: "aud-1",
    code: "AUD-2026-014",
    title: "Test audit",
    org: "o1",
    type: "",
    status: "in_progress",
    stage: 3,
    startDate: "",
    endDate: "",
    progress: 0,
    leader: "",
    members: [],
    findings: { critical: 2, high: 3, medium: 4, low: 1 },
    tasks: { total: 10, done: 6, in_progress: 3, blocked: 1, new: 0 },
    lastSync: "",
    scope: [],
    tools: [],
  } as Audit,
];
const ORGS = { o1: "Aloqa vazirligi" };

function setup() {
  return render(
    <AiScreen audits={AUDITS} orgsById={ORGS} userName="Akmal" model="qwen3-coder:30b" />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ json: async () => ({ ok: true, text: "AI javob matni" }) }),
  );
});

describe("AiScreen", () => {
  it("renders the title, the system greeting and the report builder", () => {
    setup();
    expect(screen.getByText("ai.title")).toBeInTheDocument();
    expect(screen.getByText(/ai.greeting/)).toBeInTheDocument();
    expect(screen.getByText("ai.rbTitle")).toBeInTheDocument();
  });

  it("shows the real configured model (no fake dropdown)", () => {
    setup();
    // header tag shows the full id, chat tag the short name
    expect(screen.getAllByText(/qwen3-coder/).length).toBeGreaterThan(0);
    // the old hardcoded model select is gone
    expect(screen.queryByRole("option", { name: "qwen2.5:14b-instruct" })).not.toBeInTheDocument();
  });

  it("renders the five chat presets and six prompt templates", () => {
    setup();
    expect(screen.getByRole("button", { name: /ai\.presetExec/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ai\.presetKpi/ })).toBeInTheDocument();
    expect(screen.getByText("ai.pt1")).toBeInTheDocument();
    expect(screen.getByText("ai.pt6")).toBeInTheDocument();
  });

  it("lists the report builder sections", () => {
    setup();
    expect(screen.getByText("ai.secOverview")).toBeInTheDocument();
    expect(screen.getByText("ai.secRemediation")).toBeInTheDocument();
  });

  it("sends a preset to /api/ai (chat scope), shows the reply and auto-saves it", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /ai\.presetExec/ }));
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const [url, opts] = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(url).toBe("/api/ai");
    expect(JSON.parse((opts as { body: string }).body).scope).toBe("chat");
    expect(await screen.findByText("AI javob matni")).toBeInTheDocument();
    await waitFor(() => expect(saveExchange).toHaveBeenCalled());
    const saveArg = (saveExchange as unknown as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(saveArg).toMatchObject({ auditId: "aud-1", aiText: "AI javob matni" });
  });

  it("opens the history modal (enabled) and lists saved threads", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /ai\.history/ }));
    expect(await screen.findByText("ai.histTitle")).toBeInTheDocument();
    expect(listConversations).toHaveBeenCalledWith({ auditId: "aud-1" });
  });

  it("downloads a DOCX report from the selected sections", async () => {
    const blob = new Blob(["x"]);
    (fetch as unknown as ReturnType<typeof vi.fn>).mockResolvedValue({
      ok: true,
      blob: async () => blob,
    });
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:1"),
      revokeObjectURL: vi.fn(),
    } as unknown as typeof URL);
    setup();
    await userEvent.click(screen.getByRole("button", { name: /ai\.rbDownload/ }));
    await waitFor(() => {
      const call = (fetch as unknown as ReturnType<typeof vi.fn>).mock.calls.find(
        (c) => c[0] === "/api/ai/report",
      );
      expect(call).toBeTruthy();
      expect(JSON.parse((call![1] as { body: string }).body).sections).toContain("overview");
    });
  });

  it("loads a prompt template into the input on click", async () => {
    setup();
    await userEvent.click(screen.getByText("ai.pt2"));
    expect(screen.getByLabelText("ai.placeholder")).toHaveValue("ai.pt2");
  });
});
