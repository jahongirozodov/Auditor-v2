// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  userId: "u1",
  permission: true,
  isMember: false,
  audit: { id: "AUD-1" } as { id: string } | null,
  task: { auditId: "AUD-1" } as { auditId: string } | null,
  upload: { id: "UP-1", auditId: "AUD-1", taskId: "T-1" } as Record<string, string> | null,
}));

vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: h.userId, role: "t1" })),
}));
vi.mock("@/lib/rbac.server", () => ({
  requirePermission: vi.fn(async () => h.permission),
}));
vi.mock("@/lib/audit-access", () => ({
  isAuditMember: vi.fn(async () => h.isMember),
}));
vi.mock("@/lib/prisma", () => ({
  prisma: {
    audit: { findUnique: vi.fn(async () => h.audit) },
    task: { findUnique: vi.fn(async () => h.task) },
    configUpload: { findUnique: vi.fn(async () => h.upload) },
    scannerUpload: { findUnique: vi.fn(async () => h.upload) },
    trafficUpload: { findUnique: vi.fn(async () => h.upload) },
    $transaction: vi.fn(async () => ({})),
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/server", () => ({
  after: vi.fn((fn: () => void) => {
    void fn();
  }),
}));

// Mock heavy AI/analysis dependencies so they don't error
vi.mock("@/lib/ai/ollama", () => ({
  isAiEnabled: vi.fn(() => false),
  getOllamaConfig: vi.fn(() => ({ model: "test-model" })),
  getTrafficModel: vi.fn(() => "test-model"),
  generate: vi.fn(async () => ""),
  generateJson: vi.fn(async () => ({ ok: false, raw: "", tokens: 0, latencyMs: 0 })),
}));
vi.mock("@/lib/analysis/config", () => ({
  analyzeConfigAI: vi.fn(async () => ({
    ok: true,
    analysis: { device: { vendor: "cisco", hostname: "r1", model: "m", firmware: "f" }, gaps: [] },
    raw: "",
    tokens: 0,
    latencyMs: 0,
  })),
  gapToFindingInput: vi.fn(() => ({})),
}));
vi.mock("@/lib/analysis/config/to-finding", () => ({
  gapToFindingInput: vi.fn(() => ({})),
}));
vi.mock("@/lib/analysis/scanner", () => ({
  analyzeScanner: vi.fn(() => ({ scanner: "nmap", findings: [] })),
  scannerFindingToFindingInput: vi.fn(() => ({})),
  normalizedFindingToFindingInput: vi.fn(() => ({})),
}));
vi.mock("@/lib/analysis/scanner/to-finding", () => ({
  normalizedFindingToFindingInput: vi.fn(() => ({})),
}));
vi.mock("@/lib/analysis/scanner/ai", () => ({
  normalizeScannerAI: vi.fn(async () => ({ ok: false })),
}));
vi.mock("@/lib/analysis/traffic", () => ({
  analyzeTraffic: vi.fn(() => ({ format: "text", anomalies: [], totalPackets: 0, uniqueIps: 0 })),
  trafficAnomalyToFindingInput: vi.fn(() => ({})),
}));
vi.mock("@/lib/analysis/traffic/ai", () => ({
  analyzeTrafficAI: vi.fn(async () => ({
    ok: true,
    analysis: { summary: "", anomalies: [] },
    raw: "",
    tokens: 0,
    latencyMs: 0,
  })),
}));
vi.mock("@/lib/analysis/traffic/parsers/pcap", () => ({
  parsePcap: vi.fn(() => ({ format: "pcap", anomalies: [], totalPackets: 0, uniqueIps: 0 })),
}));
vi.mock("@/lib/analysis/topology/enrich-bg", () => ({
  runTopologyEnrichment: vi.fn(async () => {}),
}));
vi.mock("@/lib/ai/prompts", () => ({
  SYSTEM: "",
  CONFIG_JSON_SCHEMA: {},
  buildConfigPrompt: vi.fn(() => ""),
  parseConfigAnalysis: vi.fn(() => null),
  parseScannerNormalization: vi.fn(() => null),
  parseTrafficAnalysis: vi.fn(() => null),
}));
vi.mock("@/lib/kpi-engine", () => ({
  emitKpiEvent: vi.fn(async () => {}),
  SEVERITY_BONUS: {},
  BONUS_PTS: 5,
}));
vi.mock("@/lib/actions/findings", () => ({
  materializeFindings: vi.fn(async () => []),
}));

import { uploadConfig, reanalyzeConfig, createConfigDrafts } from "./config";
import { uploadScannerFile, reanalyzeScanner, createScannerDrafts } from "./scanner";
import { uploadTrafficFile, reanalyzeTraffic, createTrafficDrafts } from "./traffic";

beforeEach(() => {
  h.isMember = false;
  h.audit = { id: "AUD-1" };
  h.task = { auditId: "AUD-1" };
  h.upload = { id: "UP-1", auditId: "AUD-1", taskId: "T-1" };
});

describe("uploadConfig — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await uploadConfig({
      filename: "f.txt",
      content: "x",
      auditId: "AUD-1",
      taskId: "T-1",
    });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
  it("proceeds when user is audit member", async () => {
    h.isMember = true;
    const r = await uploadConfig({
      filename: "f.txt",
      content: "x",
      auditId: "AUD-1",
      taskId: "T-1",
    });
    expect(r.ok).toBe(true);
  });
});

describe("reanalyzeConfig — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await reanalyzeConfig({ uploadId: "UP-1" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("createConfigDrafts — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await createConfigDrafts({ uploadId: "UP-1", gapIndices: [] });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("uploadScannerFile — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await uploadScannerFile({
      filename: "f.xml",
      content: "x",
      auditId: "AUD-1",
      taskId: "T-1",
    });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("reanalyzeScanner — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await reanalyzeScanner({ uploadId: "UP-1" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("createScannerDrafts — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await createScannerDrafts({ uploadId: "UP-1", findingIndices: [] });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("uploadTrafficFile — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await uploadTrafficFile({
      filename: "f.pcap",
      content: "x",
      auditId: "AUD-1",
      taskId: "T-1",
    });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("reanalyzeTraffic — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await reanalyzeTraffic({ uploadId: "UP-1" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("createTrafficDrafts — membership gate", () => {
  it("returns forbidden when user is not audit member", async () => {
    const r = await createTrafficDrafts({ uploadId: "UP-1" });
    expect(r).toEqual({ ok: false, error: "forbidden" });
  });
});
