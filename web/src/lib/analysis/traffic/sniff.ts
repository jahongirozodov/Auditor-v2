import type { TrafficFormat } from "./types";

export function sniffTraffic(filename: string, content: string): TrafficFormat {
  const lower = filename.toLowerCase();

  if (lower.endsWith(".pcap") || lower.endsWith(".pcapng")) return "pcap";

  // Zeek: starts with #separator or #fields
  if (content.startsWith("#separator") || content.startsWith("#fields")) return "zeek";

  // Suricata EVE JSON: first non-empty line is a JSON object with event_type
  const firstLine = content.trimStart().split("\n")[0] ?? "";
  if (firstLine.startsWith("{")) {
    try {
      const obj = JSON.parse(firstLine) as Record<string, unknown>;
      if ("event_type" in obj) return "suricata";
    } catch {
      // not valid JSON
    }
  }

  // Wireshark CSV: header contains Source + Destination + Protocol
  const firstCsvLine = content.split("\n")[0] ?? "";
  if (
    firstCsvLine.includes("Source") &&
    firstCsvLine.includes("Destination") &&
    firstCsvLine.includes("Protocol")
  ) {
    return "wireshark_csv";
  }

  // .log extension → treat as Zeek
  if (lower.endsWith(".log")) return "zeek";

  return "universal";
}
