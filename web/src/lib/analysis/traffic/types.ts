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

export interface TrafficParseResult {
  format: TrafficFormat;
  anomalies: TrafficAnomaly[];
  totalPackets: number;
  uniqueIps: number;
  durationHours?: number;
  protocols: TrafficProtocolStat[];
  scanDate?: string;
}

export const TRAFFIC_FORMAT_LABELS: Record<TrafficFormat, { name: string; desc: string }> = {
  pcap:          { name: "PCAP / PCAPNG",  desc: ".pcap, .pcapng"      },
  suricata:      { name: "Suricata EVE",   desc: ".json, .jsonl"       },
  zeek:          { name: "Zeek",           desc: "conn.log, dns.log"   },
  wireshark_csv: { name: "Wireshark CSV",  desc: ".csv"                },
  universal:     { name: "Universal",      desc: ".csv, .txt, .log"    },
};
