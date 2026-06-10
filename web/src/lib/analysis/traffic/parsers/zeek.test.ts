import { describe, it, expect } from "vitest";
import { parseZeek } from "./zeek";

const ZEEK_LOG = [
  "#separator \\x09",
  "#set_separator\t,",
  "#empty_field\t(empty)",
  "#unset_field\t-",
  "#path\tconn",
  "#fields\tts\tuid\tid.orig_h\tid.orig_p\tid.resp_h\tid.resp_p\tproto\tservice\tduration\torig_bytes\tresp_bytes",
  "#types\ttime\tstring\taddr\tport\taddr\tport\tenum\tstring\tinterval\tcount\tcount",
  "1704067200.000000\tabc1\t10.10.42.16\t54321\t8.8.8.8\t53\tudp\tdns\t0.123\t512\t256",
  "1704067260.000000\tdef2\t203.0.113.1\t44444\t10.20.4.142\t22\ttcp\tssh\t0.005\t64\t32",
  "1704067320.000000\tghi3\t10.10.42.16\t12345\t10.0.0.5\t23\ttcp\ttelnet\t0.010\t128\t64",
].join("\n");

describe("parseZeek", () => {
  it("returns zeek format", () => {
    expect(parseZeek(ZEEK_LOG).format).toBe("zeek");
  });

  it("counts rows as totalPackets", () => {
    expect(parseZeek(ZEEK_LOG).totalPackets).toBe(3);
  });

  it("counts unique IPs", () => {
    expect(parseZeek(ZEEK_LOG).uniqueIps).toBeGreaterThan(2);
  });

  it("detects suspicious Telnet on port 23", () => {
    const r = parseZeek(ZEEK_LOG);
    expect(r.anomalies.some(a => a.title.toLowerCase().includes("telnet"))).toBe(true);
  });

  it("includes protocol stats", () => {
    const r = parseZeek(ZEEK_LOG);
    expect(r.protocols.length).toBeGreaterThan(0);
  });

  it("never throws on empty input", () => {
    expect(() => parseZeek("")).not.toThrow();
    expect(parseZeek("").format).toBe("zeek");
  });

  it("never throws on plain text (no #fields)", () => {
    expect(() => parseZeek("not zeek format")).not.toThrow();
  });

  it("calculates duration when timestamps present", () => {
    const r = parseZeek(ZEEK_LOG);
    expect(r.durationHours).toBeGreaterThanOrEqual(0);
  });
});
