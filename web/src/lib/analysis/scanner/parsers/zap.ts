import type { ScannerFinding, ScannerParseResult, ScannerSeverity } from "../types";

/** Map ZAP riskdesc string to our ScannerSeverity. */
function riskDescToSeverity(riskdesc: string): ScannerSeverity {
  const upper = riskdesc.trim().toUpperCase();
  if (upper.startsWith("CRITICAL")) return "critical";
  if (upper.startsWith("HIGH")) return "high";
  if (upper.startsWith("MEDIUM")) return "medium";
  if (upper.startsWith("LOW")) return "low";
  return "info";
}

/** ZAP alert shape from JSON. */
interface ZapAlert {
  name?: string;
  riskdesc?: string;
  desc?: string;
  description?: string;
  solution?: string;
  instances?: Array<{ uri?: string; url?: string }>;
  cweid?: string | number;
  wascid?: string | number;
}

interface ZapSite {
  "@name"?: string;
  name?: string;
  alerts?: ZapAlert[];
}

interface ZapRoot {
  site?: ZapSite | ZapSite[];
  alerts?: ZapAlert[];
}

/** Strip HTML tags from a string (ZAP descriptions often include markup). */
function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, "").trim();
}

export function parseZap(content: string): ScannerParseResult {
  try {
    const parsed = JSON.parse(content) as ZapRoot;
    const findings: ScannerFinding[] = [];
    const hosts = new Set<string>();

    const processAlert = (alert: ZapAlert, siteName?: string): void => {
      const title = alert.name ?? "ZAP Finding";
      const rawDesc = alert.desc ?? alert.description ?? title;
      const description = stripHtml(rawDesc);
      const solution = alert.solution ? stripHtml(alert.solution) : undefined;
      const riskdesc = alert.riskdesc ?? "Informational";
      const severity = riskDescToSeverity(riskdesc);

      // Extract first instance URI as host reference.
      const instances = alert.instances ?? [];
      const firstUri = instances[0]?.uri ?? instances[0]?.url ?? siteName;
      let host: string | undefined;
      if (firstUri) {
        try {
          const u = new URL(firstUri);
          host = u.hostname;
          if (siteName) hosts.add(siteName);
          else hosts.add(u.hostname);
        } catch {
          host = firstUri;
          if (firstUri) hosts.add(firstUri);
        }
      } else if (siteName) {
        host = siteName;
        hosts.add(siteName);
      }

      findings.push({
        title,
        description,
        severity,
        host,
        solution,
      });
    };

    // Handle top-level alerts (flat format).
    if (Array.isArray(parsed.alerts)) {
      for (const alert of parsed.alerts) {
        processAlert(alert);
      }
    }

    // Handle site-based format.
    const sites = parsed.site ? (Array.isArray(parsed.site) ? parsed.site : [parsed.site]) : [];

    for (const site of sites) {
      const siteName = site["@name"] ?? site.name;
      if (siteName) hosts.add(siteName);
      const alerts = site.alerts ?? [];
      for (const alert of alerts) {
        processAlert(alert, siteName);
      }
    }

    return {
      scanner: "zap",
      findings,
      hosts: hosts.size,
    };
  } catch {
    return { scanner: "zap", findings: [], hosts: 0 };
  }
}
