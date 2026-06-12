import { sniffTraffic } from "./sniff";
import { parseSuricata } from "./parsers/suricata";
import { parseZeek } from "./parsers/zeek";
import { parseWireshark } from "./parsers/wireshark";
import { parseTrafficUniversal } from "./parsers/universal";
import type { TrafficFormat, TrafficParseResult } from "./types";

const PARSERS: Record<TrafficFormat, (c: string) => TrafficParseResult> = {
  pcap: () => ({ format: "pcap", anomalies: [], totalPackets: 0, uniqueIps: 0, protocols: [] }),
  suricata: parseSuricata,
  zeek: parseZeek,
  wireshark_csv: parseWireshark,
  universal: parseTrafficUniversal,
};

export function analyzeTraffic(filename: string, content: string): TrafficParseResult {
  const format = sniffTraffic(filename, content);
  try {
    return PARSERS[format](content);
  } catch {
    return PARSERS.universal(content);
  }
}

export type {
  TrafficAnomaly,
  TrafficParseResult,
  TrafficFormat,
  AnomalySeverity,
  TrafficConversation,
} from "./types";
export { TRAFFIC_FORMAT_LABELS } from "./types";
export { sniffTraffic } from "./sniff";
export { trafficAnomalyToFindingInput, TRAFFIC_FINDING_TYPE } from "./to-finding";
