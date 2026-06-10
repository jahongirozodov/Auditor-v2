import { describe, it, expect } from "vitest";
import { parseWireshark } from "./wireshark";

const WS_CSV = [
  '"No.","Time","Source","Destination","Protocol","Length","Info"',
  '"1","0.000000","192.168.1.1","192.168.1.2","TCP","74","SYN"',
  '"2","0.000001","192.168.1.2","192.168.1.1","TCP","74","SYN, ACK"',
  '"3","0.000002","10.0.0.1","8.8.8.8","DNS","72","Standard query 0x0001 A example.com"',
].join("\n");

describe("parseWireshark", () => {
  it("returns wireshark_csv format", () => {
    expect(parseWireshark(WS_CSV).format).toBe("wireshark_csv");
  });

  it("counts rows as totalPackets", () => {
    expect(parseWireshark(WS_CSV).totalPackets).toBe(3);
  });

  it("extracts unique IPs from Source and Destination columns", () => {
    expect(parseWireshark(WS_CSV).uniqueIps).toBeGreaterThan(0);
  });

  it("extracts protocol stats", () => {
    const r = parseWireshark(WS_CSV);
    expect(r.protocols.length).toBeGreaterThan(0);
    expect(r.protocols.some(p => p.protocol === "TCP")).toBe(true);
  });

  it("returns dns protocol stat", () => {
    const r = parseWireshark(WS_CSV);
    expect(r.protocols.some(p => p.protocol === "DNS")).toBe(true);
  });

  it("never throws on empty input", () => {
    expect(() => parseWireshark("")).not.toThrow();
    expect(parseWireshark("").format).toBe("wireshark_csv");
  });

  it("never throws on malformed CSV", () => {
    expect(() => parseWireshark(";;;not;;;csv\n\x00\x01")).not.toThrow();
  });

  it("handles quoted fields with commas", () => {
    const csv = '"No.","Time","Source","Destination","Protocol","Length","Info"\n"1","0.0","1.2.3.4","5.6.7.8","TCP","60","SYN, good"';
    const r = parseWireshark(csv);
    expect(r.totalPackets).toBe(1);
  });
});
