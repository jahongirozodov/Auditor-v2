export type ScannerType =
  | "nessus"
  | "openvas"
  | "nmap"
  | "zap"
  | "burp"
  | "universal";

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

export const SCANNER_LABELS: Record<ScannerType, { name: string; desc: string }> = {
  nessus:    { name: "Nessus",      desc: ".nessus, .csv" },
  openvas:   { name: "OpenVAS",     desc: ".xml, .csv" },
  nmap:      { name: "Nmap",        desc: ".xml, .gnmap" },
  zap:       { name: "OWASP ZAP",   desc: ".json, .html" },
  burp:      { name: "Burp Suite",  desc: ".xml, .burp" },
  universal: { name: "Universal",   desc: ".csv, .xlsx, .json, .txt" },
};
