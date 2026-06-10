import { describe, it, expect } from "vitest";
import { parsePcap } from "./pcap";

/**
 * Build a minimal little-endian classic pcap with Ethernet/IPv4/TCP packets.
 * Each packet: src IP 10.0.0.x → dst IP 10.0.0.9, given destination port.
 */
function buildPcap(packets: Array<{ ts: number; srcLast: number; dstPort: number }>): Uint8Array {
  const pktLen = 14 + 20 + 20; // eth + ipv4 + tcp(20)
  const total = 24 + packets.length * (16 + pktLen);
  const buf = new Uint8Array(total);
  const dv = new DataView(buf.buffer);

  // Global header (little-endian). Stored bytes D4 C3 B2 A1 → reads 0xd4c3b2a1 big-endian.
  buf.set([0xd4, 0xc3, 0xb2, 0xa1], 0);
  dv.setUint16(4, 2, true); // version major
  dv.setUint16(6, 4, true); // version minor
  dv.setUint32(20, 1, true); // linktype = Ethernet

  let off = 24;
  for (const p of packets) {
    dv.setUint32(off, p.ts, true); // ts_sec
    dv.setUint32(off + 4, 0, true); // ts_usec
    dv.setUint32(off + 8, pktLen, true); // incl_len
    dv.setUint32(off + 12, pktLen, true); // orig_len
    let q = off + 16;
    // Ethernet: dst(6) src(6) ethertype(2)=0x0800
    dv.setUint16(q + 12, 0x0800, false);
    q += 14;
    // IPv4
    dv.setUint8(q, 0x45); // version 4, IHL 5 (20 bytes)
    dv.setUint8(q + 9, 6); // protocol TCP
    buf.set([10, 0, 0, p.srcLast], q + 12); // src IP
    buf.set([10, 0, 0, 9], q + 16); // dst IP
    q += 20;
    // TCP: src port, dst port
    dv.setUint16(q, 40000, false);
    dv.setUint16(q + 2, p.dstPort, false);
    off += 16 + pktLen;
  }
  return buf;
}

describe("parsePcap", () => {
  it("decodes Ethernet/IPv4/TCP packets into real aggregates", () => {
    const base = 1_700_000_000;
    const r = parsePcap(
      buildPcap([
        { ts: base, srcLast: 1, dstPort: 23 },
        { ts: base + 60, srcLast: 1, dstPort: 80 },
        { ts: base + 120, srcLast: 2, dstPort: 23 },
      ]),
    );
    expect(r.format).toBe("pcap");
    expect(r.totalPackets).toBe(3);
    expect(r.uniqueIps).toBeGreaterThanOrEqual(2);
    expect(r.protocols.find((p) => p.protocol === "TCP")?.packets).toBe(3);
    // 10.0.0.1 is the source on two packets → top talker.
    expect(r.topTalkers?.[0]).toMatchObject({ ip: "10.0.0.1", packets: 2 });
    const port23 = r.topPorts?.find((p) => p.port === 23);
    expect(port23?.packets).toBe(2);
    expect(port23?.service).toBe("TELNET");
    expect(r.timeline && r.timeline.length).toBeGreaterThan(0);
    // Telnet on :23 is a flagged anomaly.
    expect(r.anomalies.some((a) => a.title.toLowerCase().includes("telnet"))).toBe(true);
    // Host-to-host conversations: 10.0.0.1/2 → 10.0.0.9.
    expect(r.conversations?.some((c) => c.src === "10.0.0.1" && c.dst === "10.0.0.9")).toBe(true);
  });

  it("flags pcapng with a note and no packets", () => {
    const ng = new Uint8Array(24);
    new DataView(ng.buffer).setUint32(0, 0x0a0d0d0a, false);
    const r = parsePcap(ng);
    expect(r.note).toBe("pcapng");
    expect(r.totalPackets).toBe(0);
  });

  it("returns an unknown note for a bad magic and never throws on junk", () => {
    const bogus = new Uint8Array(24);
    new DataView(bogus.buffer).setUint32(0, 0x12345678, false); // not a pcap magic
    expect(parsePcap(bogus).note).toBe("unknown");
    expect(() => parsePcap(new Uint8Array(0))).not.toThrow();
    expect(() => parsePcap(new Uint8Array([1, 2, 3]))).not.toThrow();
  });
});
