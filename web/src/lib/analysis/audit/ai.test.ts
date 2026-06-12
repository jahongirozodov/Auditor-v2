import { describe, it, expect, vi, beforeEach } from "vitest";

const { generateJson } = vi.hoisted(() => ({ generateJson: vi.fn() }));
const h = vi.hoisted(() => ({
  audit: {
    code: "AUD-1",
    title: "T",
    stage: 7,
    status: "in_progress",
    findings: {},
    tasksAgg: {},
  } as unknown,
  findings: [] as unknown[],
  config: [] as unknown[],
  scanner: [] as unknown[],
  topo: null as null | { output: string },
}));

vi.mock("@/lib/ai/ollama", () => ({ generateJson }));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    audit: { findUnique: vi.fn(async () => h.audit) },
    finding: { findMany: vi.fn(async () => h.findings) },
    configUpload: { findMany: vi.fn(async () => h.config) },
    scannerUpload: { findMany: vi.fn(async () => h.scanner) },
    topologyAiAnalysis: { findFirst: vi.fn(async () => h.topo) },
  },
}));

import { analyzeAuditAI } from "./ai";

function analysis() {
  return {
    executiveSummary: "Xulosa",
    overallRisk: "high",
    topRisks: [{ title: "SQLi", severity: "critical", why: "x", recommendation: "y" }],
    remediationPlan: [{ priority: "high", action: "patch" }],
    kpiNote: "ok",
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  h.audit = {
    code: "AUD-1",
    title: "T",
    stage: 7,
    status: "in_progress",
    findings: {},
    tasksAgg: {},
  };
  h.findings = [{ severity: "critical", status: "new", asset: "fw", cwe: "CWE-89", title: "SQLi" }];
  h.config = [];
  h.scanner = [];
  h.topo = null;
});

describe("analyzeAuditAI", () => {
  it("gathers context and returns the validated analysis", async () => {
    generateJson.mockResolvedValue({
      ok: true,
      raw: JSON.stringify(analysis()),
      tokens: 30,
      latencyMs: 9,
    });
    const r = await analyzeAuditAI("AUD-1");
    expect(r.ok).toBe(true);
    expect(r.analysis?.topRisks[0].title).toBe("SQLi");
    expect(generateJson).toHaveBeenCalledWith(expect.any(String), expect.anything(), {
      numPredict: 4096,
    });
  });

  it("skips the model for a truly empty audit (no rows, no modules, no aggregate)", async () => {
    h.findings = [];
    h.audit = {
      code: "AUD-1",
      title: "T",
      stage: 7,
      status: "in_progress",
      findings: {},
      tasksAgg: {},
    };
    const r = await analyzeAuditAI("AUD-1");
    expect(r.ok).toBe(false);
    expect(r.reason).toBe("no_data");
    expect(generateJson).not.toHaveBeenCalled();
  });

  it("falls back to aggregate finding counts when no finding rows are stored", async () => {
    h.findings = [];
    h.config = [];
    h.scanner = [];
    h.topo = null;
    h.audit = {
      code: "AUD-1",
      title: "T",
      stage: 7,
      status: "in_progress",
      findings: { critical: 2, high: 5, medium: 8, low: 4 },
      tasksAgg: { total: 26, done: 24 },
    };
    generateJson.mockResolvedValue({
      ok: true,
      raw: JSON.stringify(analysis()),
      tokens: 12,
      latencyMs: 7,
    });
    const r = await analyzeAuditAI("AUD-1");
    expect(r.ok).toBe(true);
    expect(generateJson).toHaveBeenCalledOnce();
  });

  it("returns ok:false for a missing audit", async () => {
    h.audit = null;
    expect((await analyzeAuditAI("nope")).ok).toBe(false);
  });

  it("degrades to ok:false (ai_unavailable) when the model is unreachable or unparseable", async () => {
    generateJson.mockResolvedValue({ ok: false, raw: "", tokens: 0, latencyMs: 0 });
    const down = await analyzeAuditAI("AUD-1");
    expect(down.ok).toBe(false);
    expect(down.reason).toBe("ai_unavailable");
    generateJson.mockResolvedValue({ ok: true, raw: "not json", tokens: 0, latencyMs: 0 });
    expect((await analyzeAuditAI("AUD-1")).reason).toBe("ai_unavailable");
  });
});
