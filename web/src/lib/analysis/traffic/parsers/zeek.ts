import type { TrafficParseResult, TrafficAnomaly, AnomalySeverity } from "../types";
import { bucketTimeline, topTalkers, topPorts, topConversations, convKey } from "../profile";

const SUSPICIOUS_PORTS: Record<number, { title: string; sev: AnomalySeverity }> = {
  23: { title: "Telnet trafik aniqlandi (oddiy matn)", sev: "high" },
  21: { title: "FTP trafik aniqlandi (oddiy matn)", sev: "medium" },
  445: { title: "SMB trafik aniqlandi", sev: "medium" },
  3389: { title: "RDP trafik aniqlandi", sev: "medium" },
  4444: { title: "Shubhali port aniqlandi (Metasploit default)", sev: "high" },
};

export function parseZeek(content: string): TrafficParseResult {
  try {
    const lines = content.split("\n");
    let fields: string[] = [];
    const rows: string[][] = [];

    for (const line of lines) {
      if (line.startsWith("#fields")) {
        fields = line.slice(8).split("\t");
      } else if (!line.startsWith("#") && line.trim()) {
        rows.push(line.split("\t"));
      }
    }

    const idx = (name: string) => fields.indexOf(name);
    const iOrigH = idx("id.orig_h");
    const iRespH = idx("id.resp_h");
    const iRespP = idx("id.resp_p");
    const iProto = idx("proto");
    const iOrigB = idx("orig_bytes");
    const iRespB = idx("resp_bytes");
    const iTs = idx("ts");

    const allIps = new Set<string>();
    const protocols: Record<string, number> = {};
    const portCounts: Record<number, number> = {};
    const talkerCounts: Record<string, number> = {};
    const convCounts: Record<string, number> = {};
    const times: number[] = [];
    const largeTx: Array<{ srcIp: string; dstIp: string; bytes: number; port: string }> = [];
    let earliestTs = Infinity;
    let latestTs = -Infinity;

    for (const row of rows) {
      const origH = iOrigH >= 0 ? (row[iOrigH] ?? "") : "";
      const respH = iRespH >= 0 ? (row[iRespH] ?? "") : "";
      const respP = iRespP >= 0 ? parseInt(row[iRespP] ?? "") : NaN;
      const proto = iProto >= 0 ? (row[iProto] ?? "other").toUpperCase() : "OTHER";
      const ts = iTs >= 0 ? parseFloat(row[iTs] ?? "") : NaN;
      const origB = iOrigB >= 0 ? parseInt(row[iOrigB] ?? "") : 0;
      const respB = iRespB >= 0 ? parseInt(row[iRespB] ?? "") : 0;

      if (origH) {
        allIps.add(origH);
        talkerCounts[origH] = (talkerCounts[origH] ?? 0) + 1;
      }
      if (respH) allIps.add(respH);
      if (origH && respH) {
        const k = convKey(origH, respH);
        convCounts[k] = (convCounts[k] ?? 0) + 1;
      }
      protocols[proto] = (protocols[proto] ?? 0) + 1;
      if (!isNaN(ts)) {
        times.push(ts);
        if (ts < earliestTs) earliestTs = ts;
        if (ts > latestTs) latestTs = ts;
      }
      if (!isNaN(respP) && respP > 0) portCounts[respP] = (portCounts[respP] ?? 0) + 1;

      const totalBytes = (isNaN(origB) ? 0 : origB) + (isNaN(respB) ? 0 : respB);
      if (totalBytes > 10_000_000 && origH && respH) {
        largeTx.push({
          srcIp: origH,
          dstIp: respH,
          bytes: totalBytes,
          port: isNaN(respP) ? "" : String(respP),
        });
      }
    }

    const anomalies: TrafficAnomaly[] = [];

    for (const [portStr, count] of Object.entries(portCounts)) {
      const port = parseInt(portStr);
      const info = SUSPICIOUS_PORTS[port];
      if (count > 100) {
        anomalies.push({
          severity: count > 500 ? "high" : "medium",
          title: info?.title ?? `Port ${port} — keng qamrovli skanerlash`,
          dstIpPort: `-:${port}`,
          eventCount: count,
        });
      } else if (info) {
        anomalies.push({
          severity: info.sev,
          title: info.title,
          dstIpPort: `-:${port}`,
          eventCount: count,
        });
      }
    }

    for (const tx of largeTx.slice(0, 3)) {
      anomalies.push({
        severity: tx.bytes > 100_000_000 ? "high" : "medium",
        title: "Katta hajmli ma'lumot uzatildi",
        srcIp: tx.srcIp,
        dstIpPort: tx.port ? `${tx.dstIp}:${tx.port}` : tx.dstIp,
        eventCount: 1,
      });
    }

    anomalies.sort((a, b) => {
      const o: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return (o[a.severity] ?? 5) - (o[b.severity] ?? 5);
    });

    const durationHours =
      isFinite(earliestTs) && isFinite(latestTs) && latestTs > earliestTs
        ? Math.round((latestTs - earliestTs) / 3_600)
        : undefined;

    return {
      format: "zeek",
      anomalies,
      totalPackets: rows.length,
      uniqueIps: allIps.size,
      durationHours,
      protocols: Object.entries(protocols)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([protocol, packets]) => ({ protocol, packets })),
      timeline: bucketTimeline(times, { epoch: true }),
      topTalkers: topTalkers(talkerCounts),
      topPorts: topPorts(portCounts),
      conversations: topConversations(convCounts),
      scanDate: isFinite(earliestTs)
        ? new Date(earliestTs * 1000).toISOString().slice(0, 10)
        : undefined,
    };
  } catch {
    return { format: "zeek", anomalies: [], totalPackets: 0, uniqueIps: 0, protocols: [] };
  }
}
