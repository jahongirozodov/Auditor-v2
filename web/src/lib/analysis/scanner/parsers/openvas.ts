import type { ScannerFinding, ScannerParseResult, ScannerSeverity } from "../types";

/** Map OpenVAS threat string to our ScannerSeverity. */
function threatToSeverity(threat: string): ScannerSeverity {
  switch (threat.trim().toLowerCase()) {
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

export function parseOpenVas(content: string): ScannerParseResult {
  try {
    const findings: ScannerFinding[] = [];
    const hosts = new Set<string>();

    // Extract all <result ...>...</result> blocks.
    const resultRe = /<result\s[^>]*>([\s\S]*?)<\/result>/gi;
    let m: RegExpExecArray | null;

    while ((m = resultRe.exec(content)) !== null) {
      const body = m[1];

      const name = childText(body, "name");
      const description = childText(body, "description");
      const threat = childText(body, "threat");
      const host = childText(body, "host");
      const portRaw = childText(body, "port");
      const severityStr = childText(body, "severity");

      if (host) hosts.add(host);

      // Extract NVT block for CVE and CVSS.
      const nvtBlock = /<nvt\s([^>]*)>([\s\S]*?)<\/nvt>/i.exec(body);
      const cveList: string[] = [];
      let cvssBase: number | undefined;
      let nvtName = "";

      if (nvtBlock) {
        const nvtBody = nvtBlock[2];
        nvtName = childText(nvtBody, "name");
        const cvssStr = childText(nvtBody, "cvss_base");
        if (cvssStr) cvssBase = parseFloat(cvssStr);

        // Collect all <cve> tags inside nvt.
        const cveRe = /<cve>([^<]+)<\/cve>/gi;
        let cveM: RegExpExecArray | null;
        while ((cveM = cveRe.exec(nvtBody)) !== null) {
          const val = cveM[1].trim();
          if (val && val !== "NOCVE") cveList.push(val);
        }
      }

      // Use severity number if available, otherwise derive from threat.
      const severityNum = severityStr ? parseFloat(severityStr) : NaN;
      let severity: ScannerSeverity;
      if (!isNaN(severityNum)) {
        if (severityNum >= 9.0) severity = "critical";
        else if (severityNum >= 7.0) severity = "high";
        else if (severityNum >= 4.0) severity = "medium";
        else if (severityNum > 0) severity = "low";
        else severity = "info";
      } else {
        severity = threatToSeverity(threat);
      }

      // Parse port string like "443/tcp".
      let portNum: string | undefined;
      let protocol: string | undefined;
      if (portRaw && portRaw !== "general/tcp" && portRaw !== "general/udp") {
        const portParts = portRaw.split("/");
        portNum = portParts[0] || undefined;
        protocol = portParts[1] || undefined;
      }

      const finding: ScannerFinding = {
        title: name || nvtName || "OpenVAS Finding",
        description: description || name,
        severity,
        host: host || undefined,
        port: portNum,
        protocol,
        cve: cveList.length > 0 ? cveList : undefined,
        cvss: cvssBase !== undefined ? cvssBase : !isNaN(severityNum) ? severityNum : undefined,
      };

      findings.push(finding);
    }

    // Try to extract scan date.
    const dateMatch = /<scan_start>([^<]+)<\/scan_start>/i.exec(content);
    let scanDate: string | undefined;
    if (dateMatch) {
      const d = new Date(dateMatch[1].trim());
      if (!isNaN(d.getTime())) scanDate = d.toISOString().split("T")[0];
    }

    return {
      scanner: "openvas",
      findings,
      hosts: hosts.size,
      scanDate,
    };
  } catch {
    return { scanner: "openvas", findings: [], hosts: 0 };
  }
}
