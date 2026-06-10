import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TopologyScreen } from "./TopologyScreen";
import { TOPOLOGY, FINDINGS, AUDITS } from "@/lib/fixtures";
import type { Topology } from "@/lib/types/entities";
import type { TopologyAnalysis } from "@/lib/analysis/topology/types";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));
vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string, params?: Record<string, unknown>) =>
    params ? `${ns}.${key}(${JSON.stringify(params)})` : `${ns}.${key}`,
}));
vi.mock("@/components/ui/Toast", () => ({ useToast: () => vi.fn() }));

const { analyzeTopology } = vi.hoisted(() => ({ analyzeTopology: vi.fn() }));
vi.mock("@/lib/actions/topology", () => ({ analyzeTopology }));

const ANALYSIS: TopologyAnalysis = {
  summary: "Tarmoq xavfi yuqori.",
  overallRisk: "high",
  // Labels intentionally distinct from graph node labels to keep getByText unambiguous.
  criticalNodes: [{ nodeId: "node-x", label: "Kritik-tugun-X", reason: "Perimetr", recommendation: "ACL" }],
  attackPaths: [{ nodes: ["node-x", "node-y"], risk: "Tashqi kirish", severity: "high" }],
  segmentationIssues: ["DMZ ajratilmagan"],
  recommendations: ["Segmentatsiyani kuchaytiring"],
};

const EMPTY: Topology = { audit: "", nodes: [], edges: [] };

function setup(topology = TOPOLOGY, latestAi: TopologyAnalysis | null = ANALYSIS) {
  return render(
    <TopologyScreen
      topology={topology}
      findings={FINDINGS}
      auditCode="AUD-2026-014"
      audits={AUDITS}
      auditId={AUDITS[0].id}
      latestAi={latestAi}
    />,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  analyzeTopology.mockResolvedValue({ ok: true, analysis: ANALYSIS });
});

describe("TopologyScreen", () => {
  it("renders the graph svg, node labels and the AI panel", () => {
    const { container } = setup();
    expect(container.querySelector("svg.topo-svg")).not.toBeNull();
    expect(screen.getByText("FW-CORE-01")).toBeInTheDocument();
    expect(screen.getByText("topology.aiTitle")).toBeInTheDocument();
    expect(screen.getByText("Tarmoq xavfi yuqori.")).toBeInTheDocument(); // hydrated from latestAi
  });

  it("selects a node on click and updates the inspector", async () => {
    setup();
    await userEvent.click(screen.getByText("FW-CORE-01"));
    expect(screen.getByText("10.0.0.1")).toBeInTheDocument();
  });

  it("hides nodes filtered out by severity", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /critical/ }));
    expect(screen.queryByText("FW-CORE-01")).toBeNull();
  });

  it("re-runs the AI analysis via the analyzeTopology action", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /topology\.aiAnalyze/ }));
    expect(analyzeTopology).toHaveBeenCalledWith({ auditId: AUDITS[0].id });
  });

  it("shows the empty state (no fixture) when the audit has no topology data", () => {
    setup(EMPTY, null);
    expect(screen.getByText("topology.empty")).toBeInTheDocument();
    expect(screen.queryByText("FW-CORE-01")).toBeNull();
    expect(analyzeTopology).not.toHaveBeenCalled(); // no auto-run on empty
  });
});
