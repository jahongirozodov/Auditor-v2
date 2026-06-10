import { describe, it, expect, vi, beforeEach } from "vitest";

const { generateJson } = vi.hoisted(() => ({ generateJson: vi.fn() }));
vi.mock("@/lib/ai/ollama", () => ({ generateJson }));

import { normalizeScannerAI, MAX_AI_FINDINGS } from "./ai";
import type { ScannerFinding } from "./types";

function finding(over: Partial<ScannerFinding> = {}): ScannerFinding {
  return {
    title: "TLS 1.0 enabled",
    description: "Weak protocol",
    severity: "high",
    host: "10.0.0.1",
    port: "443",
    ...over,
  };
}

function normalization(findings = 1) {
  return {
    summary: "Bir nechta zaiflik",
    overallRisk: "high",
    originalCount: findings,
    normalizedCount: findings,
    findings: Array.from({ length: findings }, (_, i) => ({
      title: `F${i}`,
      description: "d",
      severity: "high",
      host: "10.0.0.1",
      port: "443",
      remediation: "Patch",
      mergedCount: 2,
    })),
  };
}

beforeEach(() => vi.clearAllMocks());

describe("normalizeScannerAI", () => {
  it("returns the validated normalization on a well-formed reply", async () => {
    generateJson.mockResolvedValue({
      ok: true,
      raw: JSON.stringify(normalization(2)),
      tokens: 30,
      latencyMs: 9,
    });
    const r = await normalizeScannerAI("nessus", [finding(), finding({ title: "TLS 1.0" })]);
    expect(r.ok).toBe(true);
    expect(r.normalization?.findings).toHaveLength(2);
    expect(r.normalization?.originalCount).toBe(2);
    expect(generateJson).toHaveBeenCalledWith(expect.any(String), expect.anything(), {
      numPredict: 8192,
    });
  });

  it("skips the model and reports ok:false for an empty scan", async () => {
    const r = await normalizeScannerAI("nmap", []);
    expect(r.ok).toBe(false);
    expect(generateJson).not.toHaveBeenCalled();
  });

  it("caps input at MAX_AI_FINDINGS and appends the remainder un-normalized with a note", async () => {
    generateJson.mockResolvedValue({
      ok: true,
      raw: JSON.stringify(normalization(MAX_AI_FINDINGS)),
      tokens: 1,
      latencyMs: 1,
    });
    const many = Array.from({ length: MAX_AI_FINDINGS + 5 }, (_, i) =>
      finding({ title: `vuln-${i}`, severity: "low" }),
    );
    const r = await normalizeScannerAI("openvas", many);
    expect(r.ok).toBe(true);
    expect(r.normalization?.note).toMatch(/qolgan 5/);
    expect(r.normalization?.normalizedCount).toBe(MAX_AI_FINDINGS + 5);
    expect(r.normalization?.originalCount).toBe(MAX_AI_FINDINGS + 5);
  });

  it("degrades to ok:false when the model is unreachable or unparseable", async () => {
    generateJson.mockResolvedValue({ ok: false, raw: "", tokens: 0, latencyMs: 0 });
    expect((await normalizeScannerAI("burp", [finding()])).ok).toBe(false);
    generateJson.mockResolvedValue({ ok: true, raw: "not json", tokens: 0, latencyMs: 0 });
    expect((await normalizeScannerAI("burp", [finding()])).ok).toBe(false);
  });
});
