export type TrafficFormat = "pcap" | "suricata" | "zeek" | "wireshark_csv" | "universal";
export type AnomalySeverity = "critical" | "high" | "medium" | "low" | "info";

export interface TrafficAnomaly {
  severity: AnomalySeverity;
  title: string;
  srcIp?: string;
  dstIpPort?: string;
  timeRange?: string;
  eventCount: number;
}

export interface TrafficProtocolStat {
  protocol: string;
  packets: number;
}

/** One bucket of the real packet-volume timeline (label + count). */
export interface TrafficTimelinePoint {
  label: string;
  packets: number;
}

/** A source host ranked by packet volume (top talkers). */
export interface TrafficTalker {
  ip: string;
  packets: number;
}

/** A destination port ranked by packet volume, with a best-effort service name. */
export interface TrafficPort {
  port: number;
  packets: number;
  service?: string;
}

/** A directed host-to-host conversation (src → dst) with its packet count. */
export interface TrafficConversation {
  src: string;
  dst: string;
  packets: number;
}

export interface TrafficParseResult {
  format: TrafficFormat;
  anomalies: TrafficAnomaly[];
  totalPackets: number;
  uniqueIps: number;
  durationHours?: number;
  protocols: TrafficProtocolStat[];
  scanDate?: string;
  /** Real packet-volume-over-time buckets (empty when the format carries no timestamps). */
  timeline?: TrafficTimelinePoint[];
  /** Most active source IPs. */
  topTalkers?: TrafficTalker[];
  /** Most contacted destination ports. */
  topPorts?: TrafficPort[];
  /** Top host-to-host conversations (for the communication graph). */
  conversations?: TrafficConversation[];
  /** Non-fatal parser note (e.g. pcapng/unsupported link-layer) shown in the UI. */
  note?: string;
}

export const TRAFFIC_FORMAT_LABELS: Record<TrafficFormat, { name: string; desc: string }> = {
  pcap: { name: "PCAP / PCAPNG", desc: ".pcap, .pcapng" },
  suricata: { name: "Suricata EVE", desc: ".json, .jsonl" },
  zeek: { name: "Zeek", desc: "conn.log, dns.log" },
  wireshark_csv: { name: "Wireshark CSV", desc: ".csv" },
  universal: { name: "Universal", desc: ".csv, .txt, .log" },
};
