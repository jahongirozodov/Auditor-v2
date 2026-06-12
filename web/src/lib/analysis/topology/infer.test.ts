import { describe, it, expect } from "vitest";
import { assetToKind, ipFromDstPort, isIp, nodeKey, segmentForIp, vendorToKind } from "./infer";

describe("isIp / nodeKey / ipFromDstPort", () => {
  it("validates IPv4 and normalizes keys", () => {
    expect(isIp("10.0.0.1")).toBe(true);
    expect(isIp("999.0.0.1")).toBe(false);
    expect(isIp("host-a")).toBe(false);
    expect(nodeKey("  FW-CORE-01 ")).toBe("fw-core-01");
  });

  it("strips the port from a dst IP:port", () => {
    expect(ipFromDstPort("10.0.0.5:443")).toBe("10.0.0.5");
    expect(ipFromDstPort("example.com:80")).toBe("");
    expect(ipFromDstPort(undefined)).toBe("");
  });
});

describe("vendorToKind", () => {
  it("maps vendor labels to node kinds", () => {
    expect(vendorToKind("Cisco ASA")).toBe("firewall");
    expect(vendorToKind("FortiGate")).toBe("firewall");
    expect(vendorToKind("Nginx")).toBe("web");
    expect(vendorToKind("Cisco IOS")).toBe("switch");
    expect(vendorToKind("Linux OpenSSH")).toBe("server");
  });
});

describe("assetToKind", () => {
  it("infers kind from asset name / IP", () => {
    expect(assetToKind("10.0.0.9")).toBe("endpoint");
    expect(assetToKind("FW-CORE-01")).toBe("firewall");
    expect(assetToKind("web-prod-03")).toBe("web");
    expect(assetToKind("db-master")).toBe("db");
    expect(assetToKind("app-server-1")).toBe("server");
  });
});

describe("segmentForIp", () => {
  it("buckets IPs into coarse segments", () => {
    expect(segmentForIp("8.8.8.8")).toBe("Tashqi");
    expect(segmentForIp("10.0.0.5")).toBe("Perimetr");
    expect(segmentForIp("10.10.0.5")).toBe("DMZ");
    expect(segmentForIp("192.168.1.5")).toBe("Endpoint");
    expect(segmentForIp("not-an-ip")).toBe("Ichki tarmoq");
  });
});
