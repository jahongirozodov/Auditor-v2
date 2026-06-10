import { describe, it, expect, vi, beforeEach } from "vitest";

const { generateJson } = vi.hoisted(() => ({ generateJson: vi.fn() }));
vi.mock("@/lib/ai/ollama", () => ({ generateJson }));

import { analyzeConfigAI } from "./ai";

function analysis(overrides: Record<string, unknown> = {}) {
  return {
    device: { vendor: "cisco_asa", hostname: "FW-CORE-01", model: null, firmware: null },
    summary: "Xulosa",
    overallRisk: "high",
    gaps: [
      {
        line: 4,
        severity: "high",
        title: "Telnet",
        description: "d",
        cwe: "CWE-319",
        recommendation: "SSH",
        evidenceLine: "telnet",
        risk: "r",
        impact: "i",
      },
    ],
    ...overrides,
  };
}

beforeEach(() => vi.clearAllMocks());

describe("analyzeConfigAI", () => {
  it("returns the validated analysis on a well-formed model reply", async () => {
    generateJson.mockResolvedValue({
      ok: true,
      raw: JSON.stringify(analysis()),
      tokens: 50,
      latencyMs: 12,
    });
    const r = await analyzeConfigAI("fw-core-01.cfg", "telnet 0.0.0.0");
    expect(r.ok).toBe(true);
    expect(r.analysis?.device.vendor).toBe("cisco_asa");
    expect(r.analysis?.gaps).toHaveLength(1);
    // structured-output headroom is requested
    expect(generateJson).toHaveBeenCalledWith(expect.any(String), expect.anything(), {
      numPredict: 4096,
    });
  });

  it("falls back to the filename basename when the model omits a hostname", async () => {
    generateJson.mockResolvedValue({
      ok: true,
      raw: JSON.stringify(analysis({ device: { vendor: "nginx", hostname: null } })),
      tokens: 1,
      latencyMs: 1,
    });
    const r = await analyzeConfigAI("/etc/nginx/site.conf", "server {}");
    expect(r.analysis?.device.hostname).toBe("site");
  });

  it("reports ok:false when the model is unreachable", async () => {
    generateJson.mockResolvedValue({ ok: false, raw: "", tokens: 0, latencyMs: 0 });
    const r = await analyzeConfigAI("x.cfg", "x");
    expect(r.ok).toBe(false);
    expect(r.analysis).toBeUndefined();
  });

  it("reports ok:false when the reply is unparseable", async () => {
    generateJson.mockResolvedValue({ ok: true, raw: "not json", tokens: 0, latencyMs: 0 });
    const r = await analyzeConfigAI("x.cfg", "x");
    expect(r.ok).toBe(false);
  });
});
