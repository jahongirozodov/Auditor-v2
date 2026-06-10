import type { ScannerFinding, ScannerParseResult, ScannerSeverity } from "../types";

/** Map Burp severity string to our ScannerSeverity. */
function burpSeverityToSeverity(sev: string): ScannerSeverity {
  switch (sev.trim().toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "medium":
      return "medium";
    case "low":
      return "low";
    default:
      return "info";
  }
}

/** Extract text content of the first occurrence of <tagName>...</tagName>. */
function childText(block: string, tagName: string): string {
  const m = new RegExp(`<${tagName}[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i").exec(block);
  return m ? m[1].trim() : "";
}

/** Strip HTML and CDATA from a string. */
function stripMarkup(str: string): string {
  return str
    .replace(/<!\[CDATA\[/g, "")
    .replace(/\]\]>/g, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

export function parseBurp(content: string): ScannerParseResult {
  try {
    const findings: ScannerFinding[] = [];
    const hosts = new Set<string>();

    // Extract each <issue>...</issue> block.
    const issueRe = /<issue>([\s\S]*?)<\/issue>/gi;
    let m: RegExpExecArray | null;

    while ((m = issueRe.exec(content)) !== null) {
      const body = m[1];

      const name = stripMarkup(childText(body, "name"));
      const hostBlock =
        /<host\s[^>]*>([^<]*)<\/host>/i.exec(body) ?? /<host>([^<]*)<\/host>/i.exec(body);
      const hostUrl = hostBlock ? hostBlock[1].trim() : "";

      // Extract IP from host tag attribute: <host ip="192.168.1.1">...</host>
      const hostTagMatch = /<host\s([^>]*)>/i.exec(body);
      const hostIp = hostTagMatch
        ? (new RegExp('\\bip="([^"]+)"', "i").exec(hostTagMatch[1])?.[1] ?? "")
        : "";

      const path = stripMarkup(childText(body, "path"));
      const severity = burpSeverityToSeverity(childText(body, "severity"));
      const confidence = stripMarkup(childText(body, "confidence"));
      const issueDetail = stripMarkup(childText(body, "issueDetail"));
      const issueBackground = stripMarkup(childText(body, "issueBackground"));
      const remediationDetail = stripMarkup(childText(body, "remediationDetail"));
      const remediationBackground = stripMarkup(childText(body, "remediationBackground"));

      // Compose host reference.
      const host = hostIp || hostUrl || undefined;
      if (host) hosts.add(host);

      // Compose description from available fields.
      const descParts: string[] = [];
      if (issueDetail) descParts.push(issueDetail);
      if (issueBackground) descParts.push(issueBackground);
      const description = descParts.join("\n\n") || name;

      // Compose solution.
      const solParts: string[] = [];
      if (remediationDetail) solParts.push(remediationDetail);
      if (remediationBackground) solParts.push(remediationBackground);
      const solution = solParts.join("\n\n") || undefined;

      // Compose full title including confidence if available.
      const title = confidence ? `${name} [${confidence}]` : name || "Burp Suite Finding";

      // Extract port from path/URL if available.
      let port: string | undefined;
      let protocol: string | undefined;
      if (hostUrl) {
        try {
          const u = new URL(hostUrl);
          port =
            u.port || (u.protocol === "https:" ? "443" : u.protocol === "http:" ? "80" : undefined);
          protocol = u.protocol.replace(":", "") || undefined;
        } catch {
          // Not a valid URL — ignore.
        }
      }

      findings.push({
        title,
        description,
        severity,
        host,
        port,
        protocol,
        solution,
        pluginOutput: path || undefined,
      });
    }

    return {
      scanner: "burp",
      findings,
      hosts: hosts.size,
    };
  } catch {
    return { scanner: "burp", findings: [], hosts: 0 };
  }
}
