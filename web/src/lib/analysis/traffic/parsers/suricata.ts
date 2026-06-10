import type { TrafficParseResult, TrafficAnomaly, AnomalySeverity } from "../types";

const SEV_MAP: Record<number, AnomalySeverity> = { 1: "high", 2: "medium", 3: "low" };

function suricataSev(n: number): AnomalySeverity {
  return SEV_MAP[n] ?? "info";
}

export function parseSuricata(content: string): TrafficParseResult {
  try {
    const lines = content.split("\n").filter(Boolean);
    const allIps = new Set<string>();
    const protocols: Record<string, number> = {};
    const sigMap = new Map<string, TrafficAnomaly>();
    let totalPackets = 0;
    let earliestMs = Infinity;
    let latestMs = -Infinity;

    for (const line of lines) {
      let obj: Record<string, unknown>;
      try { obj = JSON.parse(line) as Record<string, unknown>; } catch { continue; }

      const ts = String(obj.timestamp ?? "");
      const tsMs = ts ? new Date(ts).getTime() : NaN;
      if (!isNaN(tsMs)) {
        if (tsMs < earliestMs) earliestMs = tsMs;
        if (tsMs > latestMs) latestMs = tsMs;
      }

      const proto = String(obj.proto ?? "other").toUpperCase();
      protocols[proto] = (protocols[proto] ?? 0) + 1;
      totalPackets++;

      const srcIp = String(obj.src_ip ?? "");
      const destIp = String(obj.dest_ip ?? "");
      const destPort = obj.dest_port != null ? String(obj.dest_port) : "";
      if (srcIp) allIps.add(srcIp);
      if (destIp) allIps.add(destIp);

      if (String(obj.event_type) !== "alert") continue;

      const alertObj = obj.alert as Record<string, unknown> | undefined;
      const sig = String(alertObj?.signature ?? alertObj?.category ?? "Unknown alert");
      const sevNum = typeof alertObj?.severity === "number" ? (alertObj.severity as number) : 2;
      const sev = suricataSev(sevNum);
      const dstIpPort = destPort ? `${destIp}:${destPort}` : destIp;
      const timeLabel = ts.length >= 19 ? ts.slice(11, 19) : ts;

      const existing = sigMap.get(sig);
      if (existing) {
        existing.eventCount++;
      } else {
        sigMap.set(sig, { severity: sev, title: sig, srcIp, dstIpPort, timeRange: timeLabel, eventCount: 1 });
      }
    }

    const anomalies = [...sigMap.values()].sort((a, b) => {
      const o: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
      return (o[a.severity] ?? 5) - (o[b.severity] ?? 5);
    });

    const durationHours =
      isFinite(earliestMs) && isFinite(latestMs) && latestMs > earliestMs
        ? Math.round((latestMs - earliestMs) / 3_600_000)
        : undefined;

    return {
      format: "suricata",
      anomalies,
      totalPackets,
      uniqueIps: allIps.size,
      durationHours,
      protocols: Object.entries(protocols)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([protocol, packets]) => ({ protocol, packets })),
      scanDate: isFinite(earliestMs) ? new Date(earliestMs).toISOString().slice(0, 10) : undefined,
    };
  } catch {
    return { format: "suricata", anomalies: [], totalPackets: 0, uniqueIps: 0, protocols: [] };
  }
}
