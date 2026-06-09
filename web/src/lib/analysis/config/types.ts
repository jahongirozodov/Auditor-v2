/**
 * Configuration-analysis domain types. Pure (no React / server-only) so the
 * parsers stay unit-testable. The pipeline is: sniff vendor → run the vendor
 * parser → ConfigGap[] → (AI enrich) → draft Findings.
 */

/** Supported config sources; `unknown` is the graceful fallback (zero gaps). */
export type VendorKey =
  | "cisco_ios"
  | "cisco_asa"
  | "linux_sshd"
  | "linux_sudoers"
  | "nginx"
  | "apache"
  | "mikrotik"
  | "juniper"
  | "fortinet"
  | "pfsense"
  | "unknown";

/** Gap severity — the four buckets the UI renders (no `info` for config gaps). */
export type GapSeverity = "critical" | "high" | "medium" | "low";

/** A single detected security gap in a config file. */
export interface ConfigGap {
  /** 1-based line of the offending statement; 0 = whole-file (absence) finding. */
  line: number;
  severity: GapSeverity;
  title: string;
  description: string;
  cwe: string;
  recommendation: string;
  /** The trimmed offending config line; "" for absence findings. */
  evidenceLine: string;
}

/** Result of parsing one config file. */
export interface ParseResult {
  vendor: VendorKey;
  hostname: string | null;
  model: string | null;
  firmware: string | null;
  gaps: ConfigGap[];
}

/** Human label per vendor (Uzbek-neutral product names) for device rows / UI. */
export const VENDOR_LABELS: Record<VendorKey, string> = {
  cisco_ios: "Cisco IOS",
  cisco_asa: "Cisco ASA",
  linux_sshd: "Linux OpenSSH",
  linux_sudoers: "Linux sudoers",
  nginx: "Nginx",
  apache: "Apache HTTPD",
  mikrotik: "MikroTik RouterOS",
  juniper: "Juniper JunOS",
  fortinet: "FortiGate",
  pfsense: "pfSense",
  unknown: "Aniqlanmagan",
};
