export type ScannerType = "nessus" | "openvas" | "nmap" | "zap" | "burp" | "universal";

export type ScannerSeverity = "critical" | "high" | "medium" | "low" | "info";

export interface ScannerFinding {
  title: string;
  description: string;
  severity: ScannerSeverity;
  host?: string;
  port?: string;
  protocol?: string;
  cve?: string[];
  cvss?: number;
  solution?: string;
  pluginId?: string;
  pluginOutput?: string;
}

export interface ScannerParseResult {
  scanner: ScannerType;
  findings: ScannerFinding[];
  hosts: number;
  scanDate?: string;
}

/** A finding after AI normalization — deduped, plain-language, remediation-filled. */
export interface NormalizedScannerFinding {
  title: string;
  description: string;
  severity: ScannerSeverity;
  host?: string;
  port?: string;
  cve?: string[];
  cvss?: number;
  remediation: string;
  /** How many raw parsed findings were merged into this one (>=1). */
  mergedCount?: number;
}

/** Full AI normalization of a parsed scan — persisted as JSON, rendered as cards. */
export interface ScannerNormalization {
  summary: string;
  overallRisk: ScannerSeverity;
  findings: NormalizedScannerFinding[];
  originalCount: number;
  normalizedCount: number;
  /** Set when the scan exceeded the AI cap and a remainder was kept un-normalized. */
  note?: string;
}

export const SCANNER_LABELS: Record<ScannerType, { name: string; desc: string }> = {
  nessus: { name: "Nessus", desc: ".nessus, .csv" },
  openvas: { name: "OpenVAS", desc: ".xml, .csv" },
  nmap: { name: "Nmap", desc: ".xml, .gnmap" },
  zap: { name: "OWASP ZAP", desc: ".json, .html" },
  burp: { name: "Burp Suite", desc: ".xml, .burp" },
  universal: { name: "Universal", desc: ".csv, .xlsx, .json, .txt" },
};
