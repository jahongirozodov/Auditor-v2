import { describe, it, expect, vi, beforeEach } from "vitest";

const { generateJson } = vi.hoisted(() => ({ generateJson: vi.fn() }));
vi.mock("@/lib/ai/ollama", () => ({ generateJson }));

import { enrichTopologyNodes } from "./enrich";
import type { Topology } from "@/lib/types/entities";

const TOPO: Topology = {
  audit: "AUD-1",
  nodes: [
    {
      id: "fw",
      label: "FW-CORE-01",
      ip: "10.0.0.1",
      kind: "server",
      segment: "Ichki tarmoq",
      sev: "critical",
      findings: 2,
    },
    {
      id: "web",
      label: "web-01",
      ip: "10.10.0.5",
      kind: "server",
      segment: "Ichki tarmoq",
      sev: "high",
      findings: 1,
    },
  ],
  edges: [{ s: "fw", t: "web", flag: true }],
};

const PATCHES = {
  nodes: [
    {
      id: "fw",
      kind: "firewall",
      segment: "Perimetr",
      aiLabel: "Core Firewall",
      aiReason: "FW prefiksi va 10.0.x IP",
    },
    {
      id: "web",
      kind: "web",
      segment: "DMZ",
      aiLabel: "Web Server",
      aiReason: "web prefiksi va 10.10.x IP",
    },
  ],
};

beforeEach(() => vi.clearAllMocks());

describe("enrichTopologyNodes", () => {
  it("returns enriched patches on well-formed reply", async () => {
    generateJson.mockResolvedValue({
      ok: true,
      raw: JSON.stringify(PATCHES),
      tokens: 15,
      latencyMs: 5,
    });
    const r = await enrichTopologyNodes(TOPO);
    expect(r.ok).toBe(true);
    expect(r.patches).toHaveLength(2);
    expect(r.patches[0].id).toBe("fw");
    expect(r.patches[0].kind).toBe("firewall");
    expect(r.patches[0].aiLabel).toBe("Core Firewall");
    expect(generateJson).toHaveBeenCalledWith(expect.any(String), expect.anything(), {
      numPredict: 2048,
    });
  });

  it("returns ok:false for empty topology", async () => {
    const r = await enrichTopologyNodes({ audit: "AUD-1", nodes: [], edges: [] });
    expect(r.ok).toBe(false);
    expect(r.patches).toHaveLength(0);
    expect(generateJson).not.toHaveBeenCalled();
  });

  it("degrades to ok:false when model unreachable", async () => {
    generateJson.mockResolvedValue({ ok: false, raw: "", tokens: 0, latencyMs: 0 });
    const r = await enrichTopologyNodes(TOPO);
    expect(r.ok).toBe(false);
    expect(r.patches).toHaveLength(0);
  });

  it("degrades to ok:false when reply is unparseable", async () => {
    generateJson.mockResolvedValue({ ok: true, raw: "not json at all", tokens: 5, latencyMs: 3 });
    const r = await enrichTopologyNodes(TOPO);
    expect(r.ok).toBe(false);
  });
});
