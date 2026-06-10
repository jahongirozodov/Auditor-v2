import type { TrafficParseResult } from "../types";
import { topTalkers } from "../profile";

const IP_RE = /\b(\d{1,3}\.){3}\d{1,3}\b/g;

export function parseTrafficUniversal(content: string): TrafficParseResult {
  try {
    const lines = content.split("\n").filter(Boolean);
    const allIps = new Set<string>();
    const talkerCounts: Record<string, number> = {};
    for (const line of lines) {
      const matches = [...line.matchAll(IP_RE)];
      matches.forEach((m, i) => {
        allIps.add(m[0]);
        // Treat the first IP on a line as the source for talker ranking.
        if (i === 0) talkerCounts[m[0]] = (talkerCounts[m[0]] ?? 0) + 1;
      });
    }
    return {
      format: "universal",
      anomalies: [],
      totalPackets: lines.length,
      uniqueIps: allIps.size,
      protocols: [],
      topTalkers: topTalkers(talkerCounts),
    };
  } catch {
    return { format: "universal", anomalies: [], totalPackets: 0, uniqueIps: 0, protocols: [] };
  }
}
