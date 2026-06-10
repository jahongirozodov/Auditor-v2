import { describe, it, expect } from "vitest";
import {
  BASE,
  buildConfigPrompt,
  ConfigAnalysisSchema,
  CONFIG_JSON_SCHEMA,
  parseConfigAnalysis,
  configAnalysisToNote,
  SYSTEM,
  buildScannerPrompt,
  ScannerNormalizationSchema,
  SCANNER_JSON_SCHEMA,
  parseScannerNormalization,
  buildTopologyPrompt,
  TopologyAnalysisSchema,
  TOPOLOGY_JSON_SCHEMA,
  parseTopologyAnalysis,
  AuditAnalysisSchema,
  AUDIT_JSON_SCHEMA,
  parseAuditAnalysis,
  TrafficAnalysisSchema,
  TRAFFIC_JSON_SCHEMA,
  parseTrafficAnalysis,
  buildTrafficPrompt,
} from "./prompts";
import type { TrafficParseResult } from "@/lib/analysis/traffic/types";
import type { Topology } from "@/lib/types/entities";

const ANALYSIS = {
  device: { vendor: "cisco_asa", hostname: "FW-CORE-01", model: null, firmware: "9.16(4)" },
  summary: "Xulosa",
  overallRisk: "critical",
  gaps: [
    {
      line: 4,
      severity: "critical",
      title: "Telnet yoqilgan",
      description: "Ochiq protokol",
      cwe: "CWE-319",
      recommendation: "SSH ga oʻting",
      evidenceLine: "telnet 0.0.0.0 0.0.0.0 inside",
      risk: "Parol ochiq uzatiladi",
      impact: "MITM",
      command: "no telnet 0.0.0.0 0.0.0.0 inside",
      refs: ["CWE-319"],
    },
  ],
};

describe("BASE identity guard", () => {
  it("pins the assistant identity and forbids naming the underlying model", () => {
    expect(BASE).toContain("Auditor AI");
    expect(BASE).toContain("aniq model nomini aytma");
    // every scope inherits the guard
    expect(SYSTEM.chat).toContain("Auditor AI");
    expect(SYSTEM.audit).toContain("Auditor AI");
  });
});

describe("buildConfigPrompt", () => {
  it("prefixes each config line with its 1-based number", () => {
    const out = buildConfigPrompt("fw.cfg", "hostname FW\n telnet enable");
    expect(out).toContain("Fayl nomi: fw.cfg");
    expect(out).toContain("1: hostname FW");
    expect(out).toContain("2:  telnet enable");
  });
});

describe("ConfigAnalysisSchema", () => {
  it("accepts a well-formed analysis and defaults gaps to []", () => {
    expect(ConfigAnalysisSchema.safeParse(ANALYSIS).success).toBe(true);
    const noGaps = ConfigAnalysisSchema.parse({
      device: { vendor: "nginx" },
      overallRisk: "low",
    });
    expect(noGaps.gaps).toEqual([]);
    expect(noGaps.device.hostname).toBeNull();
  });

  it("rejects an invalid vendor or severity", () => {
    expect(ConfigAnalysisSchema.safeParse({ ...ANALYSIS, overallRisk: "boom" }).success).toBe(
      false,
    );
    expect(
      ConfigAnalysisSchema.safeParse({ ...ANALYSIS, device: { vendor: "windows" } }).success,
    ).toBe(false);
  });

  it("exposes a JSON schema object and a JSON-demanding system prompt", () => {
    expect(typeof CONFIG_JSON_SCHEMA).toBe("object");
    expect(SYSTEM.config).toContain("JSON");
  });
});

describe("parseConfigAnalysis", () => {
  it("parses valid JSON and returns null for garbage / empty", () => {
    expect(parseConfigAnalysis(JSON.stringify(ANALYSIS))?.overallRisk).toBe("critical");
    expect(parseConfigAnalysis("not json")).toBeNull();
    expect(parseConfigAnalysis("")).toBeNull();
    expect(parseConfigAnalysis(null)).toBeNull();
  });
});

describe("configAnalysisToNote", () => {
  it("flattens summary + per-gap remediation + command into plain text", () => {
    const note = configAnalysisToNote(JSON.stringify(ANALYSIS));
    expect(note).toContain("Xulosa");
    expect(note).toContain("Telnet yoqilgan: SSH ga oʻting");
    expect(note).toContain("Buyruq: no telnet 0.0.0.0 0.0.0.0 inside");
  });

  it("returns undefined when there is no parseable analysis", () => {
    expect(configAnalysisToNote(null)).toBeUndefined();
    expect(configAnalysisToNote("garbage")).toBeUndefined();
  });
});

const NORMALIZATION = {
  summary: "Birlashtirildi",
  overallRisk: "high",
  originalCount: 4,
  normalizedCount: 2,
  findings: [
    {
      title: "TLS 1.0",
      description: "Weak",
      severity: "high",
      host: "10.0.0.1",
      port: "443",
      remediation: "Disable TLS 1.0",
      mergedCount: 3,
    },
  ],
};

describe("buildScannerPrompt", () => {
  it("emits a compact JSON list of the parsed findings", () => {
    const out = buildScannerPrompt("nessus", [
      { title: "A", description: "x", severity: "high", host: "h", port: "443" },
    ]);
    expect(out).toContain("Skaner: nessus");
    expect(out).toContain('"title":"A"');
    expect(out).toContain('"severity":"high"');
  });
});

describe("ScannerNormalizationSchema", () => {
  it("accepts a well-formed normalization and exposes a JSON schema", () => {
    expect(ScannerNormalizationSchema.safeParse(NORMALIZATION).success).toBe(true);
    expect(typeof SCANNER_JSON_SCHEMA).toBe("object");
    expect(SYSTEM.scanner).toContain("JSON");
  });

  it("rejects an invalid severity", () => {
    expect(
      ScannerNormalizationSchema.safeParse({ ...NORMALIZATION, overallRisk: "boom" }).success,
    ).toBe(false);
  });

  it("parses a stored normalization string and rejects garbage", () => {
    expect(parseScannerNormalization(JSON.stringify(NORMALIZATION))?.normalizedCount).toBe(2);
    expect(parseScannerNormalization("not json")).toBeNull();
    expect(parseScannerNormalization(null)).toBeNull();
  });
});

const TOPO: Topology = {
  audit: "AUD-1",
  nodes: [
    { id: "fw", label: "FW-CORE-01", ip: "10.0.0.1", kind: "firewall", segment: "Perimetr", sev: "critical", findings: 2 },
  ],
  edges: [{ s: "fw", t: "web", flag: true }],
};

const TOPO_ANALYSIS = {
  summary: "Xavf",
  overallRisk: "high",
  criticalNodes: [{ nodeId: "fw", reason: "r", recommendation: "m" }],
  attackPaths: [{ nodes: ["fw", "web"], risk: "p", severity: "high" }],
  segmentationIssues: ["x"],
  recommendations: ["y"],
};

describe("topology prompt + schema", () => {
  it("emits a compact graph JSON prompt", () => {
    const out = buildTopologyPrompt(TOPO);
    expect(out).toContain('"id":"fw"');
    expect(out).toContain("qirralar (1)");
  });

  it("validates the analysis schema and exposes a JSON schema + system prompt", () => {
    expect(TopologyAnalysisSchema.safeParse(TOPO_ANALYSIS).success).toBe(true);
    expect(TopologyAnalysisSchema.safeParse({ ...TOPO_ANALYSIS, overallRisk: "boom" }).success).toBe(false);
    expect(typeof TOPOLOGY_JSON_SCHEMA).toBe("object");
    expect(SYSTEM.topology).toContain("JSON");
  });

  it("parses a stored analysis string and rejects garbage", () => {
    expect(parseTopologyAnalysis(JSON.stringify(TOPO_ANALYSIS))?.overallRisk).toBe("high");
    expect(parseTopologyAnalysis("not json")).toBeNull();
    expect(parseTopologyAnalysis(null)).toBeNull();
  });
});

const AUDIT_ANALYSIS = {
  executiveSummary: "Audit yakunlandi.",
  overallRisk: "high",
  topRisks: [{ title: "SQLi", severity: "critical", why: "ochiq", recommendation: "tuzating" }],
  remediationPlan: [{ priority: "high", action: "patch" }],
  kpiNote: "yaxshi",
};

describe("audit analysis schema", () => {
  it("validates the schema + exposes a JSON schema + system prompt", () => {
    expect(AuditAnalysisSchema.safeParse(AUDIT_ANALYSIS).success).toBe(true);
    expect(AuditAnalysisSchema.safeParse({ ...AUDIT_ANALYSIS, overallRisk: "boom" }).success).toBe(false);
    expect(typeof AUDIT_JSON_SCHEMA).toBe("object");
    expect(SYSTEM.audit).toContain("JSON");
  });

  it("parses a stored audit-analysis string and rejects garbage", () => {
    expect(parseAuditAnalysis(JSON.stringify(AUDIT_ANALYSIS))?.overallRisk).toBe("high");
    expect(parseAuditAnalysis("not json")).toBeNull();
    expect(parseAuditAnalysis(null)).toBeNull();
  });
});

const TRAFFIC_ANALYSIS = {
  summary: "Telnet aniqlandi.",
  overallRisk: "high",
  anomalies: [
    {
      title: "Telnet trafik",
      srcIp: "10.0.0.1",
      dstIpPort: "-:23",
      severity: "high",
      attackType: "plaintext",
      confidence: "high",
      affectedHosts: ["10.0.0.1", "10.0.0.9"],
      risk: "Ochiq matn",
      impact: "Parol oshkor",
      recommendation: "SSH ga oʻting",
    },
  ],
  recommendations: ["Telnet oʻchiring"],
};

describe("traffic analysis schema (enriched)", () => {
  it("validates the enriched schema with attackType / confidence / affectedHosts", () => {
    const parsed = TrafficAnalysisSchema.safeParse(TRAFFIC_ANALYSIS);
    expect(parsed.success).toBe(true);
    expect(parsed.data?.anomalies[0].attackType).toBe("plaintext");
    expect(parsed.data?.anomalies[0].confidence).toBe("high");
    expect(parsed.data?.anomalies[0].affectedHosts).toContain("10.0.0.9");
    expect(typeof TRAFFIC_JSON_SCHEMA).toBe("object");
    expect(SYSTEM.traffic).toContain("attackType");
  });

  it("defaults attackType/confidence/affectedHosts when omitted", () => {
    const minimal = {
      summary: "ok",
      overallRisk: "low",
      anomalies: [{ title: "X", severity: "low" }],
      recommendations: [],
    };
    const p = TrafficAnalysisSchema.parse(minimal);
    expect(p.anomalies[0].attackType).toBe("other");
    expect(p.anomalies[0].confidence).toBe("medium");
    expect(p.anomalies[0].affectedHosts).toEqual([]);
  });

  it("rejects an invalid attackType and an invalid overallRisk", () => {
    expect(
      TrafficAnalysisSchema.safeParse({
        ...TRAFFIC_ANALYSIS,
        anomalies: [{ ...TRAFFIC_ANALYSIS.anomalies[0], attackType: "ufo" }],
      }).success,
    ).toBe(false);
    expect(TrafficAnalysisSchema.safeParse({ ...TRAFFIC_ANALYSIS, overallRisk: "boom" }).success).toBe(false);
  });

  it("parses a stored traffic-analysis string and rejects garbage", () => {
    expect(parseTrafficAnalysis(JSON.stringify(TRAFFIC_ANALYSIS))?.overallRisk).toBe("high");
    expect(parseTrafficAnalysis("not json")).toBeNull();
    expect(parseTrafficAnalysis(null)).toBeNull();
  });

  it("buildTrafficPrompt includes top talkers, ports and timeline peaks", () => {
    const r: TrafficParseResult = {
      format: "zeek",
      anomalies: [],
      totalPackets: 100,
      uniqueIps: 4,
      protocols: [{ protocol: "TCP", packets: 100 }],
      topTalkers: [{ ip: "10.0.0.1", packets: 80 }],
      topPorts: [{ port: 23, packets: 10, service: "TELNET" }],
      timeline: [
        { label: "00:00", packets: 10 },
        { label: "12:00", packets: 90 },
      ],
    };
    const out = buildTrafficPrompt("capture.zeek", r);
    expect(out).toContain("topTalkers");
    expect(out).toContain("topPorts");
    expect(out).toContain("timelinePeaks");
    expect(out).toContain("10.0.0.1");
  });
});
