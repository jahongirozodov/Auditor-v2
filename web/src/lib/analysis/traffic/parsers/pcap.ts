import type { TrafficParseResult, TrafficAnomaly, AnomalySeverity } from "../types";
import { bucketTimeline, topTalkers, topPorts, topConversations, convKey } from "../profile";

// Classic libpcap global-header magics (byte order + timestamp resolution).
const MAGIC_BE = 0xa1b2c3d4; // big-endian, microseconds
const MAGIC_LE = 0xd4c3b2a1; // little-endian, microseconds
const MAGIC_BE_NS = 0xa1b23c4d; // big-endian, nanoseconds
const MAGIC_LE_NS = 0x4d3cb2a1; // little-endian, nanoseconds
const MAGIC_PCAPNG = 0x0a0d0d0a; // pcapng Section Header Block

// Link-layer types we decode for IP extraction.
const DLT_NULL = 0; // 4-byte family header (loopback)
const DLT_EN10MB = 1; // Ethernet
const DLT_RAW = 101; // raw IP
const DLT_LINUX_SLL = 113; // Linux cooked v1 (16-byte header)

const SUSPICIOUS_PORTS: Record<number, { title: string; sev: AnomalySeverity }> = {
  23: { title: "Telnet trafik aniqlandi (oddiy matn)", sev: "high" },
  21: { title: "FTP trafik aniqlandi (oddiy matn)", sev: "medium" },
  445: { title: "SMB trafik aniqlandi", sev: "medium" },
  3389: { title: "RDP trafik aniqlandi", sev: "medium" },
  4444: { title: "Shubhali port aniqlandi (Metasploit default)", sev: "high" },
};

const PROTO_NAMES: Record<number, string> = {
  1: "ICMP",
  6: "TCP",
  17: "UDP",
  47: "GRE",
  50: "ESP",
  58: "ICMPV6",
};

function ipv4(dv: DataView, off: number): string {
  return `${dv.getUint8(off)}.${dv.getUint8(off + 1)}.${dv.getUint8(off + 2)}.${dv.getUint8(off + 3)}`;
}

function empty(note?: string): TrafficParseResult {
  return { format: "pcap", anomalies: [], totalPackets: 0, uniqueIps: 0, protocols: [], note };
}

interface Aggr {
  protocols: Record<string, number>;
  talkers: Record<string, number>;
  ports: Record<number, number>;
  conversations: Record<string, number>;
  ips: Set<string>;
}

/** Decode one packet payload (link-layer → IPv4 → TCP/UDP) into the aggregates. */
function decodePacket(dv: DataView, start: number, len: number, linktype: number, agg: Aggr): void {
  let off = start;
  const end = start + len;

  // Step over the link-layer header to the IP header.
  if (linktype === DLT_EN10MB) {
    if (off + 14 > end) return;
    let etherType = dv.getUint16(off + 12, false);
    off += 14;
    // Hop over up to two VLAN tags.
    for (let i = 0; i < 2 && etherType === 0x8100; i++) {
      if (off + 4 > end) return;
      etherType = dv.getUint16(off + 2, false);
      off += 4;
    }
    if (etherType !== 0x0800) return; // only IPv4 in MVP
  } else if (linktype === DLT_LINUX_SLL) {
    if (off + 16 > end) return;
    const proto = dv.getUint16(off + 14, false);
    off += 16;
    if (proto !== 0x0800) return;
  } else if (linktype === DLT_NULL) {
    if (off + 4 > end) return;
    off += 4; // 4-byte address family; assume IPv4
  } else if (linktype === DLT_RAW) {
    // IP header starts immediately.
  } else {
    return; // unsupported link-layer — packet still counted by caller
  }

  // IPv4 header.
  if (off + 20 > end) return;
  const verIhl = dv.getUint8(off);
  if (verIhl >> 4 !== 4) return; // only IPv4
  const ihl = (verIhl & 0x0f) * 4;
  if (ihl < 20 || off + ihl > end) return;
  const proto = dv.getUint8(off + 9);
  const srcIp = ipv4(dv, off + 12);
  const dstIp = ipv4(dv, off + 16);

  agg.ips.add(srcIp);
  agg.ips.add(dstIp);
  agg.talkers[srcIp] = (agg.talkers[srcIp] ?? 0) + 1;
  const ck = convKey(srcIp, dstIp);
  agg.conversations[ck] = (agg.conversations[ck] ?? 0) + 1;
  const protoName = PROTO_NAMES[proto] ?? `IP/${proto}`;
  agg.protocols[protoName] = (agg.protocols[protoName] ?? 0) + 1;

  // Destination port for TCP/UDP.
  if (proto === 6 || proto === 17) {
    const l4 = off + ihl;
    if (l4 + 4 <= end) {
      const dstPort = dv.getUint16(l4 + 2, false);
      if (dstPort > 0) agg.ports[dstPort] = (agg.ports[dstPort] ?? 0) + 1;
    }
  }
}

/**
 * Parse a classic libpcap (.pcap) byte stream — global header + per-packet records
 * → Ethernet/IPv4/TCP-UDP. Builds the same {@link TrafficParseResult} shape as the
 * text parsers (protocols, timeline, top talkers/ports, port-based anomalies).
 * Never throws. pcapng and unknown magics return an empty result with a `note`.
 */
export function parsePcap(bytes: Uint8Array): TrafficParseResult {
  try {
    if (bytes.length < 24) return empty();
    const dv = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const magicBE = dv.getUint32(0, false);

    if (magicBE === MAGIC_PCAPNG) return empty("pcapng");

    let le: boolean;
    let nano = false;
    if (magicBE === MAGIC_BE) le = false;
    else if (magicBE === MAGIC_LE) le = true;
    else if (magicBE === MAGIC_BE_NS) {
      le = false;
      nano = true;
    } else if (magicBE === MAGIC_LE_NS) {
      le = true;
      nano = true;
    } else return empty("unknown");

    const linktype = dv.getUint32(20, le);
    const agg: Aggr = { protocols: {}, talkers: {}, ports: {}, conversations: {}, ips: new Set() };
    const times: number[] = [];
    let totalPackets = 0;
    let off = 24;

    while (off + 16 <= bytes.length) {
      const tsSec = dv.getUint32(off, le);
      const tsFrac = dv.getUint32(off + 4, le);
      const inclLen = dv.getUint32(off + 8, le);
      off += 16;
      if (inclLen === 0 || off + inclLen > bytes.length) break;
      times.push(tsSec + (nano ? tsFrac / 1e9 : tsFrac / 1e6));
      decodePacket(dv, off, inclLen, linktype, agg);
      off += inclLen;
      totalPackets++;
    }

    const anomalies: TrafficAnomaly[] = [];
    for (const [portStr, count] of Object.entries(agg.ports)) {
      const port = Number(portStr);
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
    const order: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    anomalies.sort((a, b) => (order[a.severity] ?? 5) - (order[b.severity] ?? 5));

    const ipSupported =
      linktype === DLT_EN10MB ||
      linktype === DLT_RAW ||
      linktype === DLT_NULL ||
      linktype === DLT_LINUX_SLL;

    return {
      format: "pcap",
      anomalies,
      totalPackets,
      uniqueIps: agg.ips.size,
      durationHours:
        times.length > 1
          ? Math.max(0, Math.round((Math.max(...times) - Math.min(...times)) / 3600))
          : undefined,
      protocols: Object.entries(agg.protocols)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([protocol, packets]) => ({ protocol, packets })),
      timeline: bucketTimeline(times, { epoch: true }),
      topTalkers: topTalkers(agg.talkers),
      topPorts: topPorts(agg.ports),
      conversations: topConversations(agg.conversations),
      note: ipSupported ? undefined : `linktype_${linktype}`,
    };
  } catch {
    return empty("error");
  }
}
