import { describe, it, expect, vi, beforeEach } from "vitest";

const { generateJson } = vi.hoisted(() => ({ generateJson: vi.fn() }));
vi.mock("@/lib/ai/ollama", () => ({ generateJson }));

import { analyzeTopologyAI } from "./ai";
import type { Topology } from "@/lib/types/entities";

const TOPO: Topology = {
  audit: "AUD-1",
  nodes: [
    {
      id: "fw",
      label: "FW-CORE-01",
      ip: "10.0.0.1",
      kind: "firewall",
      segment: "Perimetr",
      sev: "critical",
      findings: 2,
    },
    {
      id: "web",
      label: "web-01",
      ip: "10.10.0.5",
      kind: "web",
      segment: "DMZ",
      sev: "high",
      findings: 1,
    },
  ],
  edges: [{ s: "fw", t: "web", flag: true }],
};

function analysis() {
  return {
    summary: "Xavf yuqori",
    overallRisk: "high",
    criticalNodes: [{ nodeId: "fw", reason: "Perimetr", recommendation: "ACL" }],
    attackPaths: [{ nodes: ["fw", "web"], risk: "pivot", severity: "high" }],
    segmentationIssues: ["DMZ"],
    recommendations: ["segment"],
  };
}

beforeEach(() => vi.clearAllMocks());

describe("analyzeTopologyAI", () => {
  it("returns the validated analysis on a well-formed reply", async () => {
    generateJson.mockResolvedValue({
      ok: true,
      raw: JSON.stringify(analysis()),
      tokens: 20,
      latencyMs: 8,
    });
    const r = await analyzeTopologyAI(TOPO);
    expect(r.ok).toBe(true);
    expect(r.analysis?.criticalNodes[0].nodeId).toBe("fw");
    expect(generateJson).toHaveBeenCalledWith(expect.any(String), expect.anything(), {
      numPredict: 4096,
    });
  });

  it("skips the model and reports ok:false for an empty graph", async () => {
    const r = await analyzeTopologyAI({ audit: "AUD-1", nodes: [], edges: [] });
    expect(r.ok).toBe(false);
    expect(generateJson).not.toHaveBeenCalled();
  });

  it("degrades to ok:false when unreachable or unparseable", async () => {
    generateJson.mockResolvedValue({ ok: false, raw: "", tokens: 0, latencyMs: 0 });
    expect((await analyzeTopologyAI(TOPO)).ok).toBe(false);
    generateJson.mockResolvedValue({ ok: true, raw: "not json", tokens: 0, latencyMs: 0 });
    expect((await analyzeTopologyAI(TOPO)).ok).toBe(false);
  });
});
