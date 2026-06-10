import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TrafficGraph } from "./TrafficGraph";
import type { TrafficConversation, TrafficAnomaly } from "@/lib/analysis/traffic";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string, params?: Record<string, unknown>) =>
    params ? `${key}(${JSON.stringify(params)})` : key,
}));

const CONVERSATIONS: TrafficConversation[] = [
  { src: "10.0.0.1", dst: "10.0.0.9", packets: 120 },
  { src: "8.8.8.8", dst: "10.0.0.1", packets: 30 },
  { src: "10.0.0.2", dst: "10.0.0.9", packets: 60 },
];
const ANOMALIES: TrafficAnomaly[] = [
  { severity: "high", title: "Telnet", srcIp: "10.0.0.1", dstIpPort: "10.0.0.9:23", eventCount: 5 },
];

describe("TrafficGraph", () => {
  it("renders one node per host with IP labels and the legend", () => {
    const { container } = render(<TrafficGraph conversations={CONVERSATIONS} anomalies={ANOMALIES} />);
    const graph = container.querySelector('svg[role="img"]') as SVGElement;
    // 4 unique hosts → 4 node circles (scoped to the graph, not the panel icon).
    expect(graph.querySelectorAll("circle").length).toBe(4);
    expect(screen.getByText("10.0.0.1")).toBeInTheDocument();
    expect(screen.getByText("8.8.8.8")).toBeInTheDocument();
    expect(screen.getByText("graphInternal")).toBeInTheDocument();
    expect(screen.getByText("graphExternal")).toBeInTheDocument();
    expect(screen.getByText("graphSuspicious")).toBeInTheDocument();
  });

  it("draws undirected edges between communicating hosts", () => {
    const { container } = render(<TrafficGraph conversations={CONVERSATIONS} anomalies={[]} />);
    const graph = container.querySelector('svg[role="img"]') as SVGElement;
    // 3 conversations → 3 distinct undirected edges (no pair repeats here).
    expect(graph.querySelectorAll("line").length).toBe(3);
  });

  it("shows a tooltip with packet count on node hover", async () => {
    render(<TrafficGraph conversations={CONVERSATIONS} anomalies={ANOMALIES} />);
    const label = screen.getByText("8.8.8.8");
    // hover the node group (the <text> label's parent <g>)
    await userEvent.hover(label.parentElement as Element);
    expect(screen.getByText(/graphPackets/)).toBeInTheDocument();
  });

  it("renders the empty state when there are no conversations", () => {
    render(<TrafficGraph conversations={[]} anomalies={[]} />);
    expect(screen.getByText("graphEmpty")).toBeInTheDocument();
  });
});
