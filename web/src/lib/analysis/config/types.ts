/**
 * Configuration-analysis domain types. The analyzer is now AI-driven: the model
 * reads the raw config and returns the vendor, device metadata, and every gap
 * (with line numbers). These types are the contract for that structured output,
 * the draft-finding mapping, and the UI cards.
 */

/** Supported config sources; `unknown` is the graceful fallback. */
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

/**
 * A single security gap the model found in a config file. One object serves both
 * the draft finding (line/severity/title/description/cwe/recommendation/evidence)
 * and the rich result card (risk/impact/command/refs).
 */
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
  /** Why it is dangerous (1-2 sentences). */
  risk: string;
  /** What happens if exploited (1-2 sentences). */
  impact: string;
  /** Optional corrective config command. */
  command?: string;
  /** Optional CWE / standard references. */
  refs?: string[];
}

/** Device metadata the model extracts from the config header. */
export interface ConfigDevice {
  vendor: VendorKey;
  hostname: string | null;
  model: string | null;
  firmware: string | null;
}

/** Full AI analysis of one config file — persisted as JSON and rendered as cards. */
export interface ConfigAnalysis {
  device: ConfigDevice;
  summary: string;
  overallRisk: GapSeverity;
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
