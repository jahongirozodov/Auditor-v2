import type { TrafficParseResult } from "../types";

const IP_RE = /\b(\d{1,3}\.){3}\d{1,3}\b/g;

export function parseTrafficUniversal(content: string): TrafficParseResult {
  try {
    const lines = content.split("\n").filter(Boolean);
    const allIps = new Set<string>();
    for (const line of lines) {
      for (const m of line.matchAll(IP_RE)) allIps.add(m[0]);
    }
    return {
      format: "universal",
      anomalies: [],
      totalPackets: lines.length,
      uniqueIps: allIps.size,
      protocols: [],
    };
  } catch {
    return { format: "universal", anomalies: [], totalPackets: 0, uniqueIps: 0, protocols: [] };
  }
}
