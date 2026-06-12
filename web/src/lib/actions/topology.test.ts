// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { revalidatePath } from "next/cache";

const { buildTopology, analyzeTopologyAI } = vi.hoisted(() => ({
  buildTopology: vi.fn(),
  analyzeTopologyAI: vi.fn(),
}));
const h = vi.hoisted(() => ({ canView: true }));

const TOPO = {
  audit: "AUD-1",
  nodes: [
    {
      id: "fw",
      label: "FW",
      ip: "10.0.0.1",
      kind: "firewall",
      segment: "Perimetr",
      sev: "critical",
      findings: 1,
    },
  ],
  edges: [],
};
const ANALYSIS = {
  summary: "x",
  overallRisk: "high",
  criticalNodes: [],
  attackPaths: [],
  segmentationIssues: [],
  recommendations: [],
};

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u6", role: "lead", name: "" })),
}));
vi.mock("@/lib/rbac", () => ({ canView: vi.fn(() => h.canView) }));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => h.canView) }));
vi.mock("@/lib/ai/ollama", () => ({ getOllamaConfig: () => ({ model: "qwen3-coder:30b" }) }));
vi.mock("@/lib/analysis/topology/build", () => ({ buildTopology }));
vi.mock("@/lib/analysis/topology/ai", () => ({ analyzeTopologyAI }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    topologyAiAnalysis: { create: vi.fn(async () => ({})) },
    auditLog: { create: vi.fn(async () => ({})) },
  },
}));

import { analyzeTopology } from "./topology";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

beforeEach(() => {
  vi.clearAllMocks();
  h.canView = true;
  buildTopology.mockResolvedValue(TOPO);
  analyzeTopologyAI.mockResolvedValue({
    ok: true,
    analysis: ANALYSIS,
    raw: JSON.stringify(ANALYSIS),
    tokens: 10,
    latencyMs: 5,
  });
});

describe("analyzeTopology", () => {
  it("builds, analyzes, persists and logs", async () => {
    const res = await analyzeTopology({ auditId: "AUD-1" });
    expect(res).toMatchObject({ ok: true });
    expect(res.analysis?.overallRisk).toBe("high");
    expect(mockPrisma.topologyAiAnalysis.create).toHaveBeenCalledOnce();
    const logActions = mockPrisma.auditLog.create.mock.calls.map(
      (c: [{ data: { action: string } }]) => c[0].data.action,
    );
    expect(logActions).toContain("topology.analyze");
    expect(revalidatePath).toHaveBeenCalledWith("/analysis/topology");
  });

  it("returns empty when the graph has no nodes (no AI call)", async () => {
    buildTopology.mockResolvedValue({ audit: "AUD-1", nodes: [], edges: [] });
    expect(await analyzeTopology({ auditId: "AUD-1" })).toEqual({ ok: false, error: "empty" });
    expect(analyzeTopologyAI).not.toHaveBeenCalled();
  });

  it("returns ai_unavailable (and persists nothing) when the model is down", async () => {
    analyzeTopologyAI.mockResolvedValue({ ok: false, raw: "", tokens: 0, latencyMs: 0 });
    expect(await analyzeTopology({ auditId: "AUD-1" })).toEqual({
      ok: false,
      error: "ai_unavailable",
    });
    expect(mockPrisma.topologyAiAnalysis.create).not.toHaveBeenCalled();
  });

  it("forbids a role without access", async () => {
    h.canView = false;
    expect(await analyzeTopology({ auditId: "AUD-1" })).toEqual({ ok: false, error: "forbidden" });
  });
});
