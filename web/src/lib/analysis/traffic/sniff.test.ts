import { describe, it, expect } from "vitest";
import { sniffTraffic } from "./sniff";

describe("sniffTraffic", () => {
  it("detects pcap by .pcap extension", () => {
    expect(sniffTraffic("capture.pcap", "")).toBe("pcap");
  });

  it("detects pcap by .pcapng extension", () => {
    expect(sniffTraffic("capture.pcapng", "")).toBe("pcap");
  });

  it("detects suricata by event_type in first JSON line", () => {
    const eve = '{"timestamp":"2024-01-01T00:00:00Z","event_type":"alert","src_ip":"1.2.3.4"}';
    expect(sniffTraffic("eve.json", eve)).toBe("suricata");
  });

  it("detects suricata for .jsonl file with event_type", () => {
    const eve = '{"event_type":"dns","src_ip":"1.2.3.4"}\n{"event_type":"alert"}';
    expect(sniffTraffic("eve.jsonl", eve)).toBe("suricata");
  });

  it("detects zeek by #fields header", () => {
    expect(sniffTraffic("conn.log", "#fields\tts\tuid\tid.orig_h")).toBe("zeek");
  });

  it("detects zeek by #separator header", () => {
    expect(sniffTraffic("conn.log", "#separator \\x09\n#fields\tts")).toBe("zeek");
  });

  it("detects wireshark_csv by header columns", () => {
    const header = '"No.","Time","Source","Destination","Protocol","Length","Info"';
    expect(sniffTraffic("export.csv", header)).toBe("wireshark_csv");
  });

  it("detects .log extension as zeek when no header present", () => {
    expect(sniffTraffic("unknown.log", "plain log content")).toBe("zeek");
  });

  it("falls back to universal for unrecognized content", () => {
    expect(sniffTraffic("data.txt", "some random text")).toBe("universal");
  });

  it("does not detect pcap for .json file without event_type", () => {
    expect(sniffTraffic("data.json", '{"key":"value"}')).toBe("universal");
  });
});
