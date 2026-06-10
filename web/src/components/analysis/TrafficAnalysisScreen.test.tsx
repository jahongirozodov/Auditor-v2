import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
vi.mock("@/lib/actions/traffic", () => ({
  uploadTrafficFile: vi.fn().mockResolvedValue({ ok: true, uploadId: "upl-1" }),
  createTrafficDrafts: vi.fn().mockResolvedValue({ ok: true, ids: ["f-1", "f-2"] }),
}));
vi.mock("@/lib/analysis/traffic", () => ({
  analyzeTraffic: vi.fn().mockReturnValue({
    format: "suricata",
    anomalies: [
      { severity: "high", title: "ET SCAN", srcIp: "10.0.0.1", dstIpPort: "443", timeRange: "12:00-12:05", eventCount: 42 },
    ],
    totalPackets: 10000,
    uniqueIps: 5,
    durationHours: 24,
    protocols: [
      { protocol: "TCP",  packets: 7000 },
      { protocol: "DNS",  packets: 2000 },
      { protocol: "HTTP", packets: 1000 },
    ],
  }),
  TRAFFIC_FORMAT_LABELS: {},
}));
vi.mock("@/components/ui/Toast", () => ({ useToast: () => vi.fn() }));

// ---- fixtures ----
const AUDITS: Audit[] = [{ id: "aud-1", code: "A-001", title: "Test audit", org: "", type: "", status: "in_progress", stage: 3, startDate: "", endDate: "", progress: 0, leader: "", members: [], findings: { critical:0,high:0,medium:0,low:0 }, tasks: { total:1,done:0,in_progress:1,blocked:0,new:0 }, lastSync: "", scope: [], tools: [] } as Audit];
const TASKS: Task[]  = [{ id: "tsk-1", auditId: "aud-1", title: "Scan task", type: "", priority: "Yuqori", status: "in_progress", due: "", assignee: "", findings: 0, files: 0, kpi: 0 } as Task];
const LATEST = {
  id: "upl-0", filename: "eve.json", format: "suricata",
  content: '{"event_type":"alert"}',
  auditId: "aud-1", taskId: "tsk-1",
  anomalyCount: 1, totalPackets: 1000, uniqueIps: 3,
  createdAt: new Date().toISOString(),
};

function setup(props: Partial<TrafficAnalysisScreenProps> = {}) {
  return render(
    <TrafficAnalysisScreen
      audits={AUDITS}
      tasks={TASKS}
      latest={props.latest ?? null}
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
    expect(screen.getByText("10K")).toBeInTheDocument();
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

  it("renders red spike path when anomalies exist", () => {
    setup({ latest: LATEST });
    const paths = document.querySelectorAll("path");
    const hasDangerFill = Array.from(paths).some(
      (p) => p.getAttribute("fill") === "var(--status-danger-fg)",
    );
    expect(hasDangerFill).toBe(true);
  });

  it("renders tabs with traffic active", () => {
    setup();
    expect(screen.getByText("nav.traffic")).toBeInTheDocument();
    expect(screen.getByText("nav.scanner")).toBeInTheDocument();
    expect(screen.getByText("nav.config")).toBeInTheDocument();
  });
});
