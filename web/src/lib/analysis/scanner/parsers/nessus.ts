import type { ScannerFinding, ScannerParseResult, ScannerSeverity } from "../types";

/** Map Nessus integer severity to our ScannerSeverity. */
function nessusLevelToSeverity(level: number): ScannerSeverity {
  switch (level) {
    case 4:
      return "critical";
    case 3:
      return "high";
    case 2:
      return "medium";
    case 1:
      return "low";
    default:
      return "info";
  }
}

/** Extract a named attribute from a tag string, e.g. severity="3" → "3". */
function attr(tag: string, name: string): string {
  const m = new RegExp(`\\b${name}="([^"]*)"`, "i").exec(tag);
  return m ? m[1] : "";
}

/** Extract text content of the first occurrence of <tagName>...</tagName>. */
function childText(block: string, tagName: string): string {
  const m = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i").exec(block);
  return m ? m[1].trim() : "";
}

/** Collect all text values of repeated <tagName> elements. */
function childTextAll(block: string, tagName: string): string[] {
  const re = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "gi");
  const results: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    const val = m[1].trim();
    if (val) results.push(val);
  }
  return results;
}

export function parseNessus(content: string): ScannerParseResult {
  try {
    const findings: ScannerFinding[] = [];
    const hosts = new Set<string>();

    // Extract all ReportHost blocks.
    const hostRe = /<ReportHost\s([^>]*)>([\s\S]*?)<\/ReportHost>/gi;
    let hostMatch: RegExpExecArray | null;

    while ((hostMatch = hostRe.exec(content)) !== null) {
      const hostAttrs = hostMatch[1];
      const hostBody = hostMatch[2];
      const hostName = attr(hostAttrs, "name") || "unknown";
      hosts.add(hostName);

      // Extract each ReportItem within this host.
      const itemRe = /<ReportItem\s([^>]*)>([\s\S]*?)<\/ReportItem>/gi;
      let itemMatch: RegExpExecArray | null;

      while ((itemMatch = itemRe.exec(hostBody)) !== null) {
        const itemAttrs = itemMatch[1];
        const itemBody = itemMatch[2];

        const severityNum = parseInt(attr(itemAttrs, "severity"), 10);
        const severity = nessusLevelToSeverity(isNaN(severityNum) ? 0 : severityNum);
        const pluginName = attr(itemAttrs, "pluginName");
        const pluginID = attr(itemAttrs, "pluginID");
        const port = attr(itemAttrs, "port");
        const protocol = attr(itemAttrs, "protocol");

        const description = childText(itemBody, "description");
        const solution = childText(itemBody, "solution");
        const cvssStr = childText(itemBody, "cvss_base_score");
        const pluginOutput = childText(itemBody, "plugin_output");
        const cves = childTextAll(itemBody, "cve");

        const finding: ScannerFinding = {
          title: pluginName || `Plugin ${pluginID}`,
          description: description || pluginName,
          severity,
          host: hostName,
          port: port || undefined,
          protocol: protocol || undefined,
          pluginId: pluginID || undefined,
          pluginOutput: pluginOutput || undefined,
          solution: solution || undefined,
          cve: cves.length > 0 ? cves : undefined,
          cvss: cvssStr ? parseFloat(cvssStr) : undefined,
        };

        findings.push(finding);
      }
    }

    // Try to extract scan date from ReportHost tag or report name attribute.
    const dateMatch = /start="(\d+)"/.exec(content);
    let scanDate: string | undefined;
    if (dateMatch) {
      const ts = parseInt(dateMatch[1], 10);
      scanDate = new Date(ts * 1000).toISOString().split("T")[0];
    }

    return {
      scanner: "nessus",
      findings,
      hosts: hosts.size,
      scanDate,
    };
  } catch {
    return { scanner: "nessus", findings: [], hosts: 0 };
  }
}
