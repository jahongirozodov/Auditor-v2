// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  permission: true,
  parse: {
    format: "suricata" as const,
    anomalies: [{ severity: "high" as const, title: "Port scan", eventCount: 5 }],
    totalPackets: 100,
    uniqueIps: 10,
    protocols: [],
  },
  ai: {
    ok: true,
    analysis: {
      summary: "Shubhali skan",
      overallRisk: "high" as const,
      anomalies: [
        { title: "Port scan", severity: "high" as const, risk: "r", impact: "i", recommendation: "Portni yoping" },
      ],
      recommendations: [],
    },
    raw: "{}",
    tokens: 5,
    latencyMs: 20,
  },
  upload: {
    id: "tu-1",
    filename: "eve.json",
    content: "{}",
    auditId: "AUD-1",
    taskId: "T-1",
    aiResult: JSON.stringify({
      summary: "s",
      overallRisk: "high",
      anomalies: [{ title: "Port scan", severity: "high", risk: "r", impact: "i", recommendation: "Portni yoping" }],
      recommendations: [],
    }),
  } as Record<string, unknown> | null,
  drafts: [] as unknown[],
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/audit-access", () => ({ isAuditMember: vi.fn(async () => true) }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u1", role: "lead", name: "" })),
}));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => h.permission) }));
vi.mock("@/lib/kpi-engine", () => ({ emitKpiEvent: vi.fn(async () => ({})) }));
vi.mock("@/lib/analysis/traffic", async () => {
  const actual = await vi.importActual<typeof import("@/lib/analysis/traffic")>("@/lib/analysis/traffic");
  return { ...actual, analyzeTraffic: vi.fn(() => h.parse) };
});
vi.mock("@/lib/analysis/traffic/ai", () => ({ analyzeTrafficAI: vi.fn(async () => h.ai) }));
vi.mock("./findings", () => ({
  materializeFindings: vi.fn(async (_u: string, inputs: unknown[]) => {
    h.drafts = inputs;
    return ["F-1"];
  }),
}));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    audit: { findUnique: vi.fn(async () => ({ id: "AUD-1" })) },
    task: { findUnique: vi.fn(async () => ({ auditId: "AUD-1" })) },
    trafficUpload: {
      create: vi.fn(async () => ({ id: "tu-1" })),
      findUnique: vi.fn(async () => h.upload),
      update: vi.fn(async () => ({})),
    },
    auditLog: { create: vi.fn(async () => ({})) },
    $transaction: vi.fn(),
  };
  prisma.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === "function" ? (arg as (tx: typeof prisma) => unknown)(prisma) : undefined,
  );
  return { prisma };
});

import { prisma } from "@/lib/prisma";
import { analyzeTrafficAI } from "@/lib/analysis/traffic/ai";
import { uploadTrafficFile, createTrafficDrafts, reanalyzeTraffic } from "./traffic";

const upInput = { filename: "eve.json", content: "{...}", auditId: "AUD-1", taskId: "T-1" };

beforeEach(() => {
  vi.clearAllMocks();
  h.permission = true;
  h.ai = { ...h.ai, ok: true };
});

describe("uploadTrafficFile", () => {
  it("stores the upload with AI result on success", async () => {
    const res = await uploadTrafficFile(upInput);
    expect(res.ok).toBe(true);
    expect(res.ai?.overallRisk).toBe("high");
    expect(prisma.trafficUpload.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ aiOk: true }) }),
    );
  });

  it("parses a binary pcap (base64) server-side and stores the structured result", async () => {
    // Minimal LE classic pcap: 1 Ethernet/IPv4/TCP packet to port 23 (telnet).
    const pktLen = 14 + 20 + 20;
    const buf = Buffer.alloc(24 + 16 + pktLen);
    Buffer.from([0xd4, 0xc3, 0xb2, 0xa1]).copy(buf, 0); // magic (LE)
    buf.writeUInt32LE(1, 20); // linktype Ethernet
    let o = 24;
    buf.writeUInt32LE(1_700_000_000, o); // ts_sec
    buf.writeUInt32LE(pktLen, o + 8); // incl_len
    buf.writeUInt32LE(pktLen, o + 12); // orig_len
    o += 16;
    buf.writeUInt16BE(0x0800, o + 12); // ethertype IPv4
    o += 14;
    buf.writeUInt8(0x45, o); // IPv4 ver/ihl
    buf.writeUInt8(6, o + 9); // proto TCP
    Buffer.from([10, 0, 0, 1]).copy(buf, o + 12); // src
    Buffer.from([10, 0, 0, 9]).copy(buf, o + 16); // dst
    o += 20;
    buf.writeUInt16BE(23, o + 2); // dst port 23

    const res = await uploadTrafficFile({
      filename: "capture.pcap",
      content: buf.toString("base64"),
      auditId: "AUD-1",
      taskId: "T-1",
    });
    expect(res.ok).toBe(true);
    expect(res.result?.format).toBe("pcap");
    expect(res.result?.totalPackets).toBe(1);
    const data = vi.mocked(prisma.trafficUpload.create).mock.calls[0][0].data;
    expect(data.parsed).toBeTruthy();
    expect(data.content).toBe(""); // raw bytes discarded for binary
    expect(JSON.parse(data.parsed as string).totalPackets).toBe(1);
  });

  it("strips NUL (0x00) bytes from content before storing (Postgres text safe)", async () => {
    const nul = String.fromCharCode(0);
    const res = await uploadTrafficFile({ ...upInput, content: `a${nul}b${nul}c` });
    expect(res.ok).toBe(true);
    const data = vi.mocked(prisma.trafficUpload.create).mock.calls[0][0].data;
    expect(data.content).toBe("abc");
    expect(data.content).not.toContain(nul);
  });

  it("blocks the import when AI is unreachable (hard dependency, no DB write)", async () => {
    vi.mocked(analyzeTrafficAI).mockResolvedValueOnce({ ok: false, raw: "", tokens: 0, latencyMs: 5 });
    const res = await uploadTrafficFile(upInput);
    expect(res).toEqual({ ok: false, error: "ai_unreachable" });
    expect(prisma.trafficUpload.create).not.toHaveBeenCalled();
  });

  it("forbids without the traffic.upload permission", async () => {
    h.permission = false;
    const res = await uploadTrafficFile(upInput);
    expect(res).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("createTrafficDrafts", () => {
  it("enriches drafts with the stored AI recommendation", async () => {
    const res = await createTrafficDrafts({ uploadId: "tu-1" });
    expect(res.ok).toBe(true);
    const first = h.drafts[0] as { description: string; ai?: boolean };
    expect(first.ai).toBe(true);
    expect(first.description).toContain("Portni yoping");
  });
});

describe("reanalyzeTraffic", () => {
  it("refreshes the stored AI analysis", async () => {
    const res = await reanalyzeTraffic({ uploadId: "tu-1" });
    expect(res.ok).toBe(true);
    expect(prisma.trafficUpload.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ aiOk: true }) }),
    );
  });

  it("returns ai_unreachable when the model is down", async () => {
    vi.mocked(analyzeTrafficAI).mockResolvedValueOnce({ ok: false, raw: "", tokens: 0, latencyMs: 5 });
    const res = await reanalyzeTraffic({ uploadId: "tu-1" });
    expect(res).toEqual({ ok: false, error: "ai_unreachable" });
  });
});
