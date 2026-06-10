import { describe, it, expect } from "vitest";
import { parseSuricata } from "./suricata";

const EVE = [
  '{"timestamp":"2024-01-01T14:02:00.000Z","event_type":"alert","src_ip":"10.10.42.16","dest_ip":"8.8.8.8","dest_port":53,"proto":"UDP","alert":{"severity":1,"signature":"ET DNS Long DNS Query","category":"Potentially Bad Traffic"}}',
  '{"timestamp":"2024-01-01T14:05:00.000Z","event_type":"alert","src_ip":"10.10.42.16","dest_ip":"8.8.8.8","dest_port":53,"proto":"UDP","alert":{"severity":1,"signature":"ET DNS Long DNS Query","category":"Potentially Bad Traffic"}}',
  '{"timestamp":"2024-01-01T14:03:00.000Z","event_type":"dns","src_ip":"10.0.0.1","dest_ip":"8.8.8.8","dest_port":53,"proto":"UDP"}',
].join("\n");

describe("parseSuricata", () => {
  it("returns suricata format", () => {
    expect(parseSuricata(EVE).format).toBe("suricata");
  });

  it("groups duplicate signatures into one anomaly", () => {
    const r = parseSuricata(EVE);
    expect(r.anomalies).toHaveLength(1);
    expect(r.anomalies[0]!.eventCount).toBe(2);
  });

  it("maps alert severity 1 to high", () => {
    expect(parseSuricata(EVE).anomalies[0]!.severity).toBe("high");
  });

  it("maps alert severity 2 to medium", () => {
    const line =
      '{"timestamp":"2024-01-01T10:00:00Z","event_type":"alert","src_ip":"1.2.3.4","dest_ip":"5.6.7.8","dest_port":80,"proto":"TCP","alert":{"severity":2,"signature":"Medium alert"}}';
    expect(parseSuricata(line).anomalies[0]!.severity).toBe("medium");
  });

  it("maps alert severity 3 to low", () => {
    const line =
      '{"timestamp":"2024-01-01T10:00:00Z","event_type":"alert","src_ip":"1.2.3.4","dest_ip":"5.6.7.8","dest_port":80,"proto":"TCP","alert":{"severity":3,"signature":"Low alert"}}';
    expect(parseSuricata(line).anomalies[0]!.severity).toBe("low");
  });

  it("extracts src IP", () => {
    expect(parseSuricata(EVE).anomalies[0]!.srcIp).toBe("10.10.42.16");
  });

  it("counts total packets including non-alert events", () => {
    expect(parseSuricata(EVE).totalPackets).toBe(3);
  });

  it("counts unique IPs", () => {
    expect(parseSuricata(EVE).uniqueIps).toBeGreaterThan(1);
  });

  it("includes protocol stats", () => {
    const r = parseSuricata(EVE);
    expect(r.protocols.some((p) => p.protocol === "UDP")).toBe(true);
  });

  it("never throws on empty input", () => {
    expect(() => parseSuricata("")).not.toThrow();
    expect(parseSuricata("").format).toBe("suricata");
  });

  it("never throws on malformed JSON", () => {
    expect(() => parseSuricata("{bad json\nnot json")).not.toThrow();
  });

  it("formats dst IP:port in dstIpPort", () => {
    const r = parseSuricata(EVE);
    expect(r.anomalies[0]!.dstIpPort).toContain("8.8.8.8");
  });
});
