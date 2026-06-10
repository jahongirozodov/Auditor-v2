import { describe, it, expect, vi, beforeEach } from "vitest";

const { analyzeTraffic } = vi.hoisted(() => ({ analyzeTraffic: vi.fn() }));
const h = vi.hoisted(() => ({
  devices: [] as Array<{ hostname: string; vendor: string; findingsAgg: unknown }>,
  findings: [] as Array<{ asset: string; severity: string }>,
  traffic: null as null | { filename: string; content: string },
}));

vi.mock("@/lib/analysis/traffic", () => ({ analyzeTraffic }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    analyzedDevice: { findMany: vi.fn(async () => h.devices) },
    finding: { findMany: vi.fn(async () => h.findings) },
    trafficUpload: { findFirst: vi.fn(async () => h.traffic) },
  },
}));

import { buildTopology } from "./build";

beforeEach(() => {
  vi.clearAllMocks();
  h.devices = [];
  h.findings = [];
  h.traffic = null;
  analyzeTraffic.mockReturnValue({ anomalies: [], totalPackets: 0, uniqueIps: 0, protocols: [] });
});

describe("buildTopology", () => {
  it("returns an empty graph when the audit has no data", async () => {
    const topo = await buildTopology("AUD-1");
    expect(topo).toEqual({ audit: "AUD-1", nodes: [], edges: [] });
  });

  it("builds device + finding nodes and traffic edges, merged by host/IP key", async () => {
    h.devices = [{ hostname: "FW-CORE-01", vendor: "Cisco ASA", findingsAgg: { critical: 1 } }];
    h.findings = [
      { asset: "FW-CORE-01", severity: "high" },
      { asset: "web-01", severity: "medium" },
    ];
    h.traffic = { filename: "t.csv", content: "x" };
    analyzeTraffic.mockReturnValue({
      anomalies: [{ severity: "high", srcIp: "10.0.0.9", dstIpPort: "10.0.0.5:443" }],
      totalPackets: 1,
      uniqueIps: 2,
      protocols: [],
    });

    const topo = await buildTopology("AUD-1");
    const byId = Object.fromEntries(topo.nodes.map((n) => [n.id, n]));

    // device + finding for FW-CORE-01 merge into one node
    expect(byId["fw-core-01"].kind).toBe("firewall");
    expect(byId["fw-core-01"].sev).toBe("critical"); // device agg critical kept over finding high
    expect(byId["fw-core-01"].findings).toBe(1);
    expect(byId["web-01"].kind).toBe("web");
    // traffic IP nodes + a flagged edge
    expect(byId["10.0.0.9"]).toBeTruthy();
    expect(byId["10.0.0.5"]).toBeTruthy();
    expect(topo.nodes).toHaveLength(4);
    expect(topo.edges).toEqual([{ s: "10.0.0.9", t: "10.0.0.5", flag: true }]);
  });
});
