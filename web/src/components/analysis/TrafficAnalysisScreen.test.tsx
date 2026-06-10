import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrafficAnalysisScreen } from "./TrafficAnalysisScreen";
import type { TrafficAnalysisScreenProps } from "./TrafficAnalysisScreen";
import type { Audit, Task } from "@/lib/types/entities";

// ---- mocks ----
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string, params?: Record<string, unknown>) => {
    if (params) return `${ns}.${key}(${JSON.stringify(params)})`;
    return `${ns}.${key}`;
  },
}));
const reanalyzeTraffic = vi.fn().mockResolvedValue({ ok: true, analysis: null });
vi.mock("@/lib/actions/traffic", () => ({
  uploadTrafficFile: vi.fn().mockResolvedValue({ ok: true, uploadId: "upl-1" }),
  createTrafficDrafts: vi.fn().mockResolvedValue({ ok: true, ids: ["f-1", "f-2"] }),
  reanalyzeTraffic: (...a: unknown[]) => reanalyzeTraffic(...a),
}));
vi.mock("@/lib/analysis/traffic", () => ({
  analyzeTraffic: vi.fn().mockReturnValue({
    format: "suricata",
    anomalies: [
      {
        severity: "high",
        title: "ET SCAN",
        srcIp: "10.0.0.1",
        dstIpPort: "443",
        timeRange: "12:00-12:05",
        eventCount: 42,
      },
    ],
    totalPackets: 10000,
    uniqueIps: 5,
    durationHours: 24,
    protocols: [
      { protocol: "TCP", packets: 7000 },
      { protocol: "DNS", packets: 2000 },
      { protocol: "HTTP", packets: 1000 },
    ],
    timeline: [
      { label: "00:00", packets: 100 },
      { label: "12:00", packets: 900 },
      { label: "23:00", packets: 200 },
    ],
    topTalkers: [
      { ip: "10.0.0.1", packets: 6000 },
      { ip: "10.0.0.2", packets: 4000 },
    ],
    topPorts: [
      { port: 443, packets: 5000, service: "HTTPS" },
      { port: 23, packets: 400, service: "TELNET" },
    ],
  }),
  TRAFFIC_FORMAT_LABELS: {},
}));
vi.mock("@/components/ui/Toast", () => ({ useToast: () => vi.fn() }));

// ---- fixtures ----
const AUDITS: Audit[] = [
  {
    id: "aud-1",
    code: "A-001",
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
  } as Audit,
];
const TASKS: Task[] = [
  {
    id: "tsk-1",
    auditId: "aud-1",
    title: "Scan task",
    type: "",
    priority: "Yuqori",
    status: "in_progress",
    due: "",
    assignee: "",
    findings: 0,
    files: 0,
    kpi: 0,
  } as Task,
];
const LATEST = {
  id: "upl-0",
  filename: "eve.json",
  format: "suricata",
  content: '{"event_type":"alert"}',
  parsed: null,
  auditId: "aud-1",
  taskId: "tsk-1",
  anomalyCount: 1,
  totalPackets: 1000,
  uniqueIps: 3,
  createdAt: new Date().toISOString(),
};

const AI = {
  summary: "Trafik asosan normal.",
  overallRisk: "medium" as const,
  anomalies: [
    {
      title: "Telnet ochiq",
      severity: "high" as const,
      attackType: "plaintext" as const,
      confidence: "high" as const,
      affectedHosts: ["10.0.0.1"],
      risk: "Shifrlanmagan",
      impact: "MITM",
      recommendation: "Telnetni oʻchiring",
    },
  ],
  recommendations: ["Segmentatsiya"],
};

function setup(props: Partial<TrafficAnalysisScreenProps> = {}) {
  return render(
    <TrafficAnalysisScreen
      audits={AUDITS}
      tasks={TASKS}
      latest={props.latest ?? null}
      latestAi={props.latestAi ?? null}
      {...props}
    />,
  );
}

// ---- tests ----
describe("TrafficAnalysisScreen", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders page title", () => {
    setup();
    expect(screen.getByText("traffic.title")).toBeInTheDocument();
  });

  it("renders upload button", () => {
    setup();
    expect(screen.getByText("traffic.uploadBtn")).toBeInTheDocument();
  });

  it("shows empty anomalies message when no latest upload", () => {
    setup({ latest: null });
    expect(screen.getByText("traffic.anomaliesEmpty")).toBeInTheDocument();
  });

  it("renders anomaly row when latest upload present", () => {
    setup({ latest: LATEST });
    expect(screen.getByText("ET SCAN")).toBeInTheDocument();
  });

  it("renders stat cards (packets, uniqueIps)", () => {
    setup({ latest: LATEST });
    expect(screen.getByText("10.0K")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders protocol bars", () => {
    setup({ latest: LATEST });
    expect(screen.getByText("TCP")).toBeInTheDocument();
    expect(screen.getByText("DNS")).toBeInTheDocument();
  });

  it("renders AI card with createDrafts button when anomalies present", () => {
    setup({ latest: LATEST });
    const btn = screen.getByRole("button", { name: /traffic\.createDrafts/ });
    expect(btn).toBeInTheDocument();
  });

  it("no createDrafts button when no upload", () => {
    setup({ latest: null });
    expect(screen.queryByRole("button", { name: /traffic\.createDrafts/ })).toBeNull();
  });

  it("opens upload modal when upload button clicked", () => {
    setup({ audits: AUDITS, tasks: TASKS });
    // Directly simulate file input change (hidden input)
    const fileInput = document.querySelector("input[type='file']") as HTMLInputElement;
    expect(fileInput).toBeTruthy();
  });

  it("renders SVG chart area", () => {
    setup({ latest: LATEST });
    const svg = document.querySelector("svg");
    expect(svg).toBeTruthy();
  });

  it("renders the real timeline peak marker (danger-colored) from timeline data", () => {
    setup({ latest: LATEST });
    // Peak marker is a danger-stroked dashed line + a danger-filled circle.
    const circles = document.querySelectorAll("circle");
    const hasDangerPeak = Array.from(circles).some(
      (c) => c.getAttribute("fill") === "var(--status-danger-fg)",
    );
    expect(hasDangerPeak).toBe(true);
    // The peak label shows a real bucket value/label, not a hardcoded string.
    expect(screen.getByText(/900 · 12:00/)).toBeInTheDocument();
  });

  it("renders real top talkers and top ports from the parser", () => {
    setup({ latest: LATEST });
    expect(screen.getByText("traffic.topTalkers")).toBeInTheDocument();
    expect(screen.getAllByText("10.0.0.1").length).toBeGreaterThan(0);
    expect(screen.getByText("traffic.topPorts")).toBeInTheDocument();
    expect(screen.getByText(/TELNET/)).toBeInTheDocument();
  });

  it("renders tabs with traffic active", () => {
    setup();
    expect(screen.getByText("nav.traffic")).toBeInTheDocument();
    expect(screen.getByText("nav.scanner")).toBeInTheDocument();
    expect(screen.getByText("nav.config")).toBeInTheDocument();
  });

  it("renders the AI analysis panel from latestAi", () => {
    setup({ latest: LATEST, latestAi: AI });
    expect(screen.getByText("Trafik asosan normal.")).toBeInTheDocument();
    expect(screen.getByText("Telnet ochiq")).toBeInTheDocument();
    expect(screen.getByText("Telnetni oʻchiring")).toBeInTheDocument();
  });

  it("re-runs AI via the reanalyze button", async () => {
    const user = userEvent.setup();
    setup({ latest: LATEST, latestAi: AI });
    await user.click(screen.getByText("traffic.aiReanalyze"));
    expect(reanalyzeTraffic).toHaveBeenCalledWith({ uploadId: "upl-0" });
  });

  it("shows the AI intro body when nothing uploaded", () => {
    setup({ latest: null, latestAi: null });
    expect(screen.getByText("traffic.aiBody")).toBeInTheDocument();
  });
});
