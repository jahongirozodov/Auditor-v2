import { z } from "zod";
import type { ConfigAnalysis } from "@/lib/analysis/config/types";
import type {
  ScannerFinding,
  ScannerNormalization,
  ScannerType,
} from "@/lib/analysis/scanner/types";
import type { TopologyAnalysis } from "@/lib/analysis/topology/types";
import type { TrafficParseResult } from "@/lib/analysis/traffic/types";
import type { AuditAnalysis } from "@/lib/analysis/audit/types";
import type { Topology } from "@/lib/types/entities";

/**
 * Shared AI prompt + structured-output contract. The config scope is now the
 * *analyzer itself*: the model reads the raw config and returns the vendor,
 * device metadata, and every security gap (with line numbers).
 */

export const BASE =
  'Sen Auditor kiberxavfsizlik audit platformasining AI yordamchisisan — lokal Ollama, yopiq tarmoq.\nFaqat oʻzbek tilida (lotin yozuvi), rasmiy va aniq yoz. Hech qachon markdown belgilari ishlatma.\nSen "Auditor AI" deb atalasan. Qaysi model yoki texnologiyada ishlashing soʻralsa, aniq model nomini aytma — faqat "Auditor platformasining lokal AI yordamchisi" deb javob ber.';

export type AiScope =
  | "config"
  | "scanner"
  | "topology"
  | "topology_enrich"
  | "traffic"
  | "audit"
  | "chat";

/** System prompt per scope. Config/scanner scopes demand strict JSON. */
export const SYSTEM: Record<AiScope, string> = {
  config: `${BASE}
Sen tarmoq qurilmasi konfiguratsiyasini tahlil qiluvchi xavfsizlik auditorisan.
Senga raqamlangan satrlar bilan xom konfiguratsiya beriladi. Faqat JSON obyekt qaytar —
boshqa matn, izoh yoki kod bloki belgisi qoʻshma.

Avval qurilmani aniqla: "device" obyektida vendor (cisco_ios, cisco_asa, linux_sshd,
linux_sudoers, nginx, apache, mikrotik, juniper, fortinet, pfsense yoki unknown), hostname,
model va firmware (agar koʻrinsa, aks holda null).

Soʻng har bir xavfsizlik kamchiligini top va "gaps" massiviga yoz. Har bir kamchilik uchun:
- line: kamchilik joylashgan aniq satr raqami (berilgan raqamdan foydalan). Butun-fayl/yetishmovchilik kamchiligi uchun 0.
- severity: critical | high | medium | low.
- title: qisqa nom.
- description: kamchilik tavsifi.
- cwe: tegishli CWE identifikatori (masalan "CWE-319"), bilmasang "".
- recommendation: bartaraf etish boʻyicha aniq amaliy tavsiya.
- evidenceLine: muammoli konfiguratsiya satri (trim qilingan), butun-fayl kamchiligi uchun "".
- risk: nega xavfli ekani (1-2 gap).
- impact: ekspluatatsiya qilinsa oqibati (1-2 gap).
- command: (ixtiyoriy) tuzatuvchi konfiguratsiya buyrugʻi.
- refs: (ixtiyoriy) CWE yoki standart havolalari.

Yana "summary" (umumiy holat, 1-2 gap) va "overallRisk" (critical/high/medium/low) ber.
Hech qanday kamchilik boʻlmasa "gaps" boʻsh massiv boʻlsin.`,
  scanner: `${BASE}
Sen zaiflik skaneri (Nessus/OpenVAS/Nmap/Burp/ZAP) natijalarini normallashtiruvchi auditorisan.
Senga ajratib olingan xom findinglar roʻyxati (JSON) beriladi. Faqat JSON obyekt qaytar.
Vazifalar:
- Bir xil yoki juda oʻxshash findinglarni (bir host/port, bir zaiflik) BITTA yozuvga birlashtir;
  birlashtirilgan sonni "mergedCount" ga yoz.
- Har bir yozuv uchun: title (sodda, aniq), description (sodda texnik til), severity
  (critical/high/medium/low/info), host, port, cve (massiv), cvss (agar boʻlsa), remediation (amaliy
  bartaraf etish tavsiyasi).
- Severity asoslimi tekshir; kerak boʻlsa CVE/CVSS asosida toʻgʻrila.
Yana "summary" (umumiy holat), "overallRisk", "originalCount" (kiruvchi findinglar soni) va
"normalizedCount" (chiquvchi yozuvlar soni) ber.`,
  topology: `${BASE}
Sen tarmoq topologiyasini baholovchi xavfsizlik auditorisan. Senga grafning nodlari (qurilma/host,
kind, segment, sev, findings soni) va qirralari (s→t, shubhali oqim flag) JSON koʻrinishida beriladi.
Faqat JSON obyekt qaytar. Tahlil qil:
- summary: tarmoq xavfsizligi umumiy bahosi (2-3 gap).
- overallRisk: critical/high/medium/low.
- criticalNodes: eng xavfli nodlar — har biri {nodeId (berilgan id), reason, recommendation}.
- attackPaths: ehtimoliy hujum yoʻllari — har biri {nodes (id roʻyxati), risk, severity}.
- segmentationIssues: segmentatsiya/izolyatsiya muammolari (matn roʻyxati).
- recommendations: umumiy tavsiyalar (matn roʻyxati).`,
  topology_enrich: `${BASE}
Sen tarmoq qurilmalarini klassifikatsiya qiluvchi xavfsizlik auditorisan.
Senga tarmoq topologiyasining nodlari beriladi: har biri id, label (hostname yoki IP), ip, va hozirgi heuristik kind/segment (ular notoʻgʻri boʻlishi mumkin).
Har bir nod uchun toʻgʻri klassifikatsiya qaytar.

kind mumkin qiymatlari: cloud | firewall | ips | vpn | switch | server | web | db | wifi | endpoint
segment mumkin qiymatlari: Perimetr | DMZ | Server farm | Ichki tarmoq | Endpoint | Tashqi

Qoidalar:
- Hostname "fw", "firewall", "asa", "fortigate", "pfsense" → firewall
- Hostname "web", "http", "nginx", "apache", "www", "portal" → web
- Hostname "db", "sql", "mysql", "postgres", "maria", "oracle" → db
- Hostname "sw", "switch", "core-sw", "distribution" → switch
- Hostname "vpn", "ra-vpn" → vpn
- Hostname "ids", "ips", "snort", "suricata" → ips
- IP 10.0.x.x → Perimetr; 10.10.x.x yoki 10.20.x.x → DMZ; 192.168.x.x → Endpoint; tashqi IP → Tashqi
- aiLabel: qisqa koʻrsatuvchi nom (masalan "Core Firewall", "Web Server 1", "DB Cluster")
- aiReason: nima sababdan bu klassifikatsiya (1 gap, oʻzbek tilida)

Faqat JSON obyekt qaytar: {"nodes": [{id, kind, segment, aiLabel, aiReason}, ...]}
Berilgan har bir nodga mos yozuv boʻlsin — hech biri tushib qolmasin.`,
  traffic: `${BASE}
Sen tarmoq trafigi tahlilchisi xavfsizlik auditorisan. Senga parser natijasi JSON koʻrinishida
beriladi: anomaliyalar, protokol statistikasi, eng faol manba IP (topTalkers), eng koʻp ishlatilgan
portlar (topPorts) va trafik hajmi cho'qqilari (timelinePeaks). Faqat JSON obyekt qaytar — boshqa matn,
izoh yoki kod bloki belgisi qoʻshma. Tahlil qil:
- summary: trafik xavfsizligi umumiy bahosi (2-3 gap), eng muhim signalga urgʻu ber.
- overallRisk: critical/high/medium/low — eng yuqori anomaliya severity'siga mos.
- anomalies: har bir anomaliya uchun:
  - title: qisqa aniq nom.
  - srcIp / dstIpPort: agar maʼlum boʻlsa (topTalkers/topPorts dan foydalan).
  - severity: critical/high/medium/low/info.
  - attackType: scan | exfiltration | c2 | plaintext | dos | lateral | bruteforce | malware | other —
    eng mos hujum turini tanla (Telnet/FTP=plaintext, ko'p port=scan, katta chiquvchi hajm=exfiltration,
    takroriy tashqi ulanish=c2, bir IP→ko'p ichki host=lateral, ko'p urinish=bruteforce).
  - confidence: high/medium/low — dalil kuchiga qarab.
  - affectedHosts: taʼsirlangan IP'lar roʻyxati (manba/maqsad).
  - risk (nega xavfli), impact (oqibati), recommendation (aniq amaliy tavsiya, oʻzbek tilida).
  Berilgan anomaliyalar tartibini saqla.
- recommendations: umumiy ustuvor tavsiyalar (matn roʻyxati).
Anomaliya boʻlmasa "anomalies" boʻsh massiv, summary'da trafik normal ekanini ayt.
Faqat berilgan maʼlumotga tayan — IP yoki port oʻylab topma.`,
  audit: `${BASE}
Sen butun auditni baholovchi bosh xavfsizlik auditorisan. Senga audit konteksti (findinglar,
modul tahlillari, vazifa/KPI hisoblari) JSON koʻrinishida beriladi. Faqat JSON obyekt qaytar.
Tahlil qil:
- executiveSummary: rahbariyat uchun qisqa xulosa (3-5 gap).
- overallRisk: critical/high/medium/low.
- topRisks: eng muhim risklar — har biri {title, severity, why (nega muhim), recommendation}.
- remediationPlan: ustuvor bartaraf etish qadamlari — har biri {priority (critical/high/medium/low), action}.
- kpiNote: audit samaradorligi/KPI boʻyicha qisqa izoh.`,
  chat: `${BASE}
Auditorlarga findinglar tahlili, remediation reja, executive summary, KPI va hisobot boʻlimlarini tayyorlashda yordam ber. Javobni qisqa va tuzilgan koʻrinishda ber.`,
};

/**
 * Recursively lowercase known enum fields so model output like "High" or
 * "SCAN" still validates against strict Zod enums. Only targets field names
 * that map to enum types — leaves human-readable strings untouched.
 */
const ENUM_FIELDS = new Set([
  "severity",
  "overallRisk",
  "vendor",
  "attackType",
  "confidence",
  "priority",
  "level",
  "risk",
  "flag",
]);

function normalizeEnumFields(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(normalizeEnumFields);
  if (obj !== null && typeof obj === "object") {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        k,
        ENUM_FIELDS.has(k) && typeof v === "string" ? v.toLowerCase() : normalizeEnumFields(v),
      ]),
    );
  }
  return obj;
}

const VENDOR_ENUM = z.enum([
  "cisco_ios",
  "cisco_asa",
  "linux_sshd",
  "linux_sudoers",
  "nginx",
  "apache",
  "mikrotik",
  "juniper",
  "fortinet",
  "pfsense",
  "unknown",
]);

const SEVERITY_ENUM = z.enum(["critical", "high", "medium", "low"]);

const GapSchema = z.object({
  line: z.number().int().default(0),
  severity: SEVERITY_ENUM,
  title: z.string(),
  description: z.string(),
  cwe: z.string().default(""),
  recommendation: z.string(),
  evidenceLine: z.string().default(""),
  risk: z.string().default(""),
  impact: z.string().default(""),
  command: z.string().optional(),
  refs: z.array(z.string()).optional(),
});

/** Structured config-analysis result — the model's output and the UI's input. */
export const ConfigAnalysisSchema = z.object({
  device: z.object({
    vendor: VENDOR_ENUM,
    hostname: z.string().nullable().default(null),
    model: z.string().nullable().default(null),
    firmware: z.string().nullable().default(null),
  }),
  summary: z.string().default(""),
  overallRisk: SEVERITY_ENUM,
  gaps: z.array(GapSchema).default([]),
});

/** Source of truth is {@link ConfigAnalysis}; the schema must satisfy it. */
export type ConfigAiAnalysis = ConfigAnalysis;

/** JSON Schema handed to Ollama `format` for structured decoding. */
export const CONFIG_JSON_SCHEMA = z.toJSONSchema(ConfigAnalysisSchema);

/** Parse a stored/raw AI output string into the structured result, or null. */
export function parseConfigAnalysis(raw: string | null | undefined): ConfigAiAnalysis | null {
  if (!raw) return null;
  try {
    const parsed = ConfigAnalysisSchema.safeParse(normalizeEnumFields(JSON.parse(raw)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Flatten the structured analysis to a plain-text note woven into draft findings. */
export function configAnalysisToNote(raw: string | null | undefined): string | undefined {
  const a = parseConfigAnalysis(raw);
  if (!a) return undefined;
  const parts: string[] = [];
  if (a.summary) parts.push(a.summary);
  for (const g of a.gaps) {
    const seg = [`${g.title}: ${g.recommendation}`];
    if (g.command) seg.push(`Buyruq: ${g.command}`);
    parts.push(seg.join(" "));
  }
  return parts.join("\n") || undefined;
}

/** Build the analyzer prompt — numbered config lines so the model cites real lines. */
export function buildConfigPrompt(filename: string, content: string): string {
  const numbered = content
    .split(/\r?\n/)
    .map((ln, i) => `${i + 1}: ${ln}`)
    .join("\n");
  return `Fayl nomi: ${filename}\n\nKonfiguratsiya (raqamlangan satrlar):\n${numbered}`;
}

// ---------- Scanner normalization ----------

const NormalizedFindingSchema = z.object({
  title: z.string(),
  description: z.string().default(""),
  severity: z.enum(["critical", "high", "medium", "low", "info"]),
  host: z.string().optional(),
  port: z.string().optional(),
  cve: z.array(z.string()).optional(),
  cvss: z.number().optional(),
  remediation: z.string().default(""),
  mergedCount: z.number().int().optional(),
});

/** Structured scanner-normalization result — the model's output and the UI's input. */
export const ScannerNormalizationSchema = z.object({
  summary: z.string().default(""),
  overallRisk: z.enum(["critical", "high", "medium", "low", "info"]),
  findings: z.array(NormalizedFindingSchema).default([]),
  originalCount: z.number().int().default(0),
  normalizedCount: z.number().int().default(0),
  note: z.string().optional(),
});

/** Source of truth is {@link ScannerNormalization}; the schema must satisfy it. */
export type ScannerAiNormalization = ScannerNormalization;

export const SCANNER_JSON_SCHEMA = z.toJSONSchema(ScannerNormalizationSchema);

export function parseScannerNormalization(
  raw: string | null | undefined,
): ScannerAiNormalization | null {
  if (!raw) return null;
  try {
    const parsed = ScannerNormalizationSchema.safeParse(normalizeEnumFields(JSON.parse(raw)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Compact JSON list of parsed findings — small even for hundreds of rows. */
export function buildScannerPrompt(scanner: ScannerType, findings: ScannerFinding[]): string {
  const compact = findings.map((f, i) => ({
    i,
    title: f.title,
    severity: f.severity,
    host: f.host,
    port: f.port,
    cve: f.cve,
    cvss: f.cvss,
    desc: f.description?.slice(0, 400),
  }));
  return `Skaner: ${scanner}. Xom findinglar (${findings.length}):\n${JSON.stringify(compact)}`;
}

// ---------- Topology analysis ----------

const TOPO_RISK = z.enum(["critical", "high", "medium", "low"]);

/** Structured topology-analysis result — the model's output and the UI's input. */
export const TopologyAnalysisSchema = z.object({
  summary: z.string().default(""),
  overallRisk: TOPO_RISK,
  criticalNodes: z
    .array(
      z.object({
        nodeId: z.string(),
        label: z.string().optional(),
        reason: z.string().default(""),
        recommendation: z.string().default(""),
      }),
    )
    .default([]),
  attackPaths: z
    .array(
      z.object({
        nodes: z.array(z.string()).default([]),
        risk: z.string().default(""),
        severity: TOPO_RISK,
      }),
    )
    .default([]),
  segmentationIssues: z.array(z.string()).default([]),
  recommendations: z.array(z.string()).default([]),
});

/** Source of truth is {@link TopologyAnalysis}; the schema must satisfy it. */
export type TopologyAiAnalysis = TopologyAnalysis;

export const TOPOLOGY_JSON_SCHEMA = z.toJSONSchema(TopologyAnalysisSchema);

export function parseTopologyAnalysis(raw: string | null | undefined): TopologyAiAnalysis | null {
  if (!raw) return null;
  try {
    const parsed = TopologyAnalysisSchema.safeParse(normalizeEnumFields(JSON.parse(raw)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Compact JSON of the built graph (nodes + edges) for the analyzer prompt. */
export function buildTopologyPrompt(topology: Topology): string {
  const nodes = topology.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    ip: n.ip || undefined,
    kind: n.kind,
    segment: n.segment,
    sev: n.sev,
    findings: n.findings,
  }));
  const edges = topology.edges.map((e) => ({ s: e.s, t: e.t, flag: e.flag || undefined }));
  return `Tarmoq grafi — nodlar (${nodes.length}) va qirralar (${edges.length}):\n${JSON.stringify({ nodes, edges })}`;
}

// ---------- Traffic analysis ----------

const TRAFFIC_SEV = z.enum(["critical", "high", "medium", "low", "info"]);
const ATTACK_TYPE = z.enum([
  "scan",
  "exfiltration",
  "c2",
  "plaintext",
  "dos",
  "lateral",
  "bruteforce",
  "malware",
  "other",
]);
const CONFIDENCE = z.enum(["high", "medium", "low"]);

/** Structured traffic-analysis result — the model's output and the UI's input. */
export const TrafficAnalysisSchema = z.object({
  summary: z.string().default(""),
  overallRisk: SEVERITY_ENUM,
  anomalies: z
    .array(
      z.object({
        title: z.string(),
        srcIp: z.string().optional(),
        dstIpPort: z.string().optional(),
        severity: TRAFFIC_SEV,
        attackType: ATTACK_TYPE.default("other"),
        confidence: CONFIDENCE.default("medium"),
        affectedHosts: z.array(z.string()).default([]),
        risk: z.string().default(""),
        impact: z.string().default(""),
        recommendation: z.string().default(""),
      }),
    )
    .default([]),
  recommendations: z.array(z.string()).default([]),
});

export type TrafficAiAnalysis = z.infer<typeof TrafficAnalysisSchema>;

export const TRAFFIC_JSON_SCHEMA = z.toJSONSchema(TrafficAnalysisSchema);

export function parseTrafficAnalysis(raw: string | null | undefined): TrafficAiAnalysis | null {
  if (!raw) return null;
  try {
    const parsed = TrafficAnalysisSchema.safeParse(normalizeEnumFields(JSON.parse(raw)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Compact JSON of the parser output (anomalies + profile) for the analyzer prompt. */
export function buildTrafficPrompt(filename: string, r: TrafficParseResult): string {
  const compact = {
    format: r.format,
    totalPackets: r.totalPackets,
    uniqueIps: r.uniqueIps,
    durationHours: r.durationHours,
    protocols: r.protocols,
    topTalkers: r.topTalkers,
    topPorts: r.topPorts,
    // A coarse volume shape so the model can reason about spikes/bursts.
    timelinePeaks: r.timeline
      ? r.timeline
          .map((p, i) => ({ i, label: p.label, packets: p.packets }))
          .sort((a, b) => b.packets - a.packets)
          .slice(0, 5)
      : undefined,
    anomalies: r.anomalies.map((a, i) => ({
      i,
      severity: a.severity,
      title: a.title,
      srcIp: a.srcIp,
      dstIpPort: a.dstIpPort,
      eventCount: a.eventCount,
    })),
  };
  return `Fayl: ${filename}. Trafik tahlili (parser natijasi):\n${JSON.stringify(compact)}`;
}

// ---------- Audit-level analysis ----------

const AUDIT_RISK = z.enum(["critical", "high", "medium", "low"]);

/** Structured whole-audit analysis — the model's output and the UI's input. */
export const AuditAnalysisSchema = z.object({
  executiveSummary: z.string().default(""),
  overallRisk: AUDIT_RISK,
  topRisks: z
    .array(
      z.object({
        title: z.string(),
        severity: AUDIT_RISK,
        why: z.string().default(""),
        recommendation: z.string().default(""),
      }),
    )
    .default([]),
  remediationPlan: z
    .array(z.object({ priority: AUDIT_RISK, action: z.string().default("") }))
    .default([]),
  kpiNote: z.string().default(""),
});

/** Source of truth is {@link AuditAnalysis}; the schema must satisfy it. */
export type AuditAiAnalysis = AuditAnalysis;

export const AUDIT_JSON_SCHEMA = z.toJSONSchema(AuditAnalysisSchema);

export function parseAuditAnalysis(raw: string | null | undefined): AuditAiAnalysis | null {
  if (!raw) return null;
  try {
    const parsed = AuditAnalysisSchema.safeParse(normalizeEnumFields(JSON.parse(raw)));
    return parsed.success ? parsed.data : null;
  } catch {
    return null;
  }
}

/** Build the analyzer prompt from a gathered audit context object. */
export function buildAuditPrompt(context: unknown): string {
  return `Audit konteksti:\n${JSON.stringify(context)}`;
}

// ---------- Topology enrichment ----------

const NODE_KIND_ENUM = z.enum([
  "cloud",
  "firewall",
  "ips",
  "vpn",
  "switch",
  "server",
  "web",
  "db",
  "wifi",
  "endpoint",
]);

const EnrichedNodePatchSchema = z.object({
  id: z.string(),
  kind: NODE_KIND_ENUM,
  segment: z.string().default("Ichki tarmoq"),
  aiLabel: z.string().default(""),
  aiReason: z.string().default(""),
});

const TopologyEnrichmentOutputSchema = z.object({
  nodes: z.array(EnrichedNodePatchSchema).default([]),
});

export type EnrichedNodePatchAi = z.infer<typeof EnrichedNodePatchSchema>;

export const TOPOLOGY_ENRICH_JSON_SCHEMA = z.toJSONSchema(TopologyEnrichmentOutputSchema);

export function parseTopologyEnrichment(
  raw: string | null | undefined,
): EnrichedNodePatchAi[] | null {
  if (!raw) return null;
  try {
    const parsed = TopologyEnrichmentOutputSchema.safeParse(normalizeEnumFields(JSON.parse(raw)));
    return parsed.success ? parsed.data.nodes : null;
  } catch {
    return null;
  }
}

/** Compact node list for the enrichment prompt. */
export function buildEnrichmentPrompt(topology: Topology): string {
  const nodes = topology.nodes.map((n) => ({
    id: n.id,
    label: n.label,
    ip: n.ip || undefined,
    currentKind: n.kind,
    currentSegment: n.segment,
  }));
  return `Tarmoq nodlari (${nodes.length}):\n${JSON.stringify(nodes)}`;
}
