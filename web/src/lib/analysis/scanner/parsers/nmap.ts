import type { ScannerFinding, ScannerParseResult, ScannerSeverity } from "../types";

/** Ports considered high-risk regardless of scripts. */
const HIGH_RISK_PORTS: Set<number> = new Set([23]); // Telnet

/** Ports considered medium-risk. */
const MEDIUM_RISK_PORTS: Set<number> = new Set([21, 22, 80, 8080, 8443]);

/** Derive severity for an open port. */
function portSeverity(portNum: number, hasScripts: boolean): ScannerSeverity {
  if (HIGH_RISK_PORTS.has(portNum)) return "high";
  if (hasScripts) return "medium";
  if (MEDIUM_RISK_PORTS.has(portNum)) return "medium";
  return "info";
}

/** Extract a named attribute from a tag string. */
function attr(tag: string, name: string): string {
  const m = new RegExp(`\\b${name}="([^"]*)"`, "i").exec(tag);
  return m ? m[1] : "";
}

/** Collect all <script ...> output attributes within a block. */
function collectScripts(block: string): string[] {
  const re = /<script\s[^>]*/gi;
  const outputs: string[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(block)) !== null) {
    const output = attr(m[0], "output");
    if (output) outputs.push(output);
  }
  return outputs;
}

export function parseNmap(content: string): ScannerParseResult {
  try {
    const findings: ScannerFinding[] = [];
    const hosts = new Set<string>();

    // Extract scan start time.
    const startMatch = /\bstart="(\d+)"/.exec(content);
    let scanDate: string | undefined;
    if (startMatch) {
      const ts = parseInt(startMatch[1], 10);
      scanDate = new Date(ts * 1000).toISOString().split("T")[0];
    }

    // Extract each <host>...</host> block.
    const hostRe = /<host[\s>]([\s\S]*?)<\/host>/gi;
    let hostMatch: RegExpExecArray | null;

    while ((hostMatch = hostRe.exec(content)) !== null) {
      const hostBody = hostMatch[1];

      // Get host address.
      const addrMatch = /<address\s[^>]*addr="([^"]+)"[^>]*/i.exec(hostBody);
      const hostAddr = addrMatch ? addrMatch[1] : "unknown";
      hosts.add(hostAddr);

      // Only process hosts with status="up".
      const statusMatch = /<status\s[^>]*/i.exec(hostBody);
      if (statusMatch) {
        const state = attr(statusMatch[0], "state");
        if (state && state.toLowerCase() !== "up") continue;
      }

      // Extract hostname if available.
      const hostnameMatch = /<hostname\s[^>]*/i.exec(hostBody);
      const hostname = hostnameMatch ? attr(hostnameMatch[0], "name") : "";

      // Extract <ports>...</ports> block.
      const portsBlock = /<ports>([\s\S]*?)<\/ports>/i.exec(hostBody);
      if (!portsBlock) continue;

      // Extract each <port ...>...</port> block.
      const portRe = /<port\s([^>]*)>([\s\S]*?)<\/port>/gi;
      let portMatch: RegExpExecArray | null;

      while ((portMatch = portRe.exec(portsBlock[1])) !== null) {
        const portAttrs = portMatch[1];
        const portBody = portMatch[2];

        // Only open ports.
        const stateBlock = /<state\s[^>]*/i.exec(portBody);
        if (!stateBlock) continue;
        const portState = attr(stateBlock[0], "state");
        if (portState.toLowerCase() !== "open") continue;

        const protocol = attr(portAttrs, "protocol") || "tcp";
        const portId = attr(portAttrs, "portid");
        const portNum = parseInt(portId, 10);

        // Get service name.
        const serviceBlock = /<service\s[^>]*/i.exec(portBody);
        const serviceName = serviceBlock ? attr(serviceBlock[0], "name") : "";
        const serviceProduct = serviceBlock ? attr(serviceBlock[0], "product") : "";

        // Collect scripts.
        const scripts = collectScripts(portBody);
        const hasScripts = scripts.length > 0;

        const severity = portSeverity(portNum, hasScripts);

        const serviceLabel = serviceProduct
          ? `${serviceName} (${serviceProduct})`
          : serviceName || "unknown";

        const title = `Open port: ${portId}/${protocol} (${serviceLabel})`;
        const descParts: string[] = [`Host: ${hostAddr}`];
        if (hostname) descParts.push(`Hostname: ${hostname}`);
        descParts.push(`Service: ${serviceLabel}`);
        if (hasScripts) {
          descParts.push("Script output:", ...scripts.slice(0, 3));
        }

        const finding: ScannerFinding = {
          title,
          description: descParts.join("\n"),
          severity,
          host: hostAddr,
          port: portId,
          protocol,
        };

        findings.push(finding);
      }
    }

    return {
      scanner: "nmap",
      findings,
      hosts: hosts.size,
      scanDate,
    };
  } catch {
    return { scanner: "nmap", findings: [], hosts: 0 };
  }
}
