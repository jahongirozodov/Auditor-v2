import type { TrafficParseResult, TrafficAnomaly, AnomalySeverity } from "../types";
import { bucketTimeline, topTalkers, topConversations, convKey } from "../profile";

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let inQuote = false;
  let cur = "";
  for (const ch of line) {
    if (ch === '"') {
      inQuote = !inQuote;
    } else if (ch === "," && !inQuote) {
      result.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  result.push(cur);
  return result;
}

const ALERT_PATTERNS: Array<{ re: RegExp; title: string; sev: AnomalySeverity }> = [
  { re: /\bSYN\b.*\bSYN\b/i, title: "TCP SYN scan aniqlandi", sev: "high" },
  { re: /\bRST\b/i, title: "Ko'p TCP RST — port skan", sev: "medium" },
  { re: /ARP.*who.*has/i, title: "ARP sweep aniqlandi", sev: "medium" },
];

export function parseWireshark(content: string): TrafficParseResult {
  try {
    const lines = content.split("\n");
    const headers = parseCsvLine(lines[0] ?? "").map((h) =>
      h.toLowerCase().replace(/"/g, "").trim(),
    );
    const iSrc = headers.indexOf("source");
    const iDst = headers.indexOf("destination");
    const iProto = headers.indexOf("protocol");
    const iInfo = headers.indexOf("info");
    const iTime = headers.indexOf("time");

    const allIps = new Set<string>();
    const protocols: Record<string, number> = {};
    const infoFreq: Record<string, number> = {};
    const talkerCounts: Record<string, number> = {};
    const convCounts: Record<string, number> = {};
    const times: number[] = [];
    let totalPackets = 0;

    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvLine(lines[i] ?? "");
      if (row.length < 3) continue;
      const src = iSrc >= 0 ? (row[iSrc] ?? "").replace(/"/g, "").trim() : "";
      const dst = iDst >= 0 ? (row[iDst] ?? "").replace(/"/g, "").trim() : "";
      const proto =
        iProto >= 0 ? (row[iProto] ?? "Other").replace(/"/g, "").trim().toUpperCase() : "OTHER";
      const info = iInfo >= 0 ? (row[iInfo] ?? "").replace(/"/g, "").trim() : "";
      const time = iTime >= 0 ? parseFloat((row[iTime] ?? "").replace(/"/g, "").trim()) : NaN;
      if (src) {
        allIps.add(src);
        talkerCounts[src] = (talkerCounts[src] ?? 0) + 1;
      }
      if (dst) allIps.add(dst);
      if (src && dst) {
        const k = convKey(src, dst);
        convCounts[k] = (convCounts[k] ?? 0) + 1;
      }
      if (!isNaN(time)) times.push(time);
      protocols[proto] = (protocols[proto] ?? 0) + 1;
      if (info) infoFreq[info] = (infoFreq[info] ?? 0) + 1;
      totalPackets++;
    }

    const anomalies: TrafficAnomaly[] = [];
    for (const [info, count] of Object.entries(infoFreq)) {
      if (count < 10) continue;
      for (const { re, title, sev } of ALERT_PATTERNS) {
        if (!re.test(info)) continue;
        const existing = anomalies.find((a) => a.title === title);
        if (existing) {
          existing.eventCount += count;
        } else {
          anomalies.push({ severity: sev, title, eventCount: count });
        }
        break;
      }
    }

    anomalies.sort((a, b) => {
      const o: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return (o[a.severity] ?? 5) - (o[b.severity] ?? 5);
    });

    return {
      format: "wireshark_csv",
      anomalies,
      totalPackets,
      uniqueIps: allIps.size,
      protocols: Object.entries(protocols)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([protocol, packets]) => ({ protocol, packets })),
      // Wireshark "Time" is relative seconds from capture start → ordinal labels.
      timeline: bucketTimeline(times, { epoch: false }),
      topTalkers: topTalkers(talkerCounts),
      conversations: topConversations(convCounts),
    };
  } catch {
    return { format: "wireshark_csv", anomalies: [], totalPackets: 0, uniqueIps: 0, protocols: [] };
  }
}
