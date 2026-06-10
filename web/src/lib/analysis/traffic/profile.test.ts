import { describe, it, expect } from "vitest";
import {
  bucketTimeline,
  topTalkers,
  topPorts,
  serviceName,
  topConversations,
  convKey,
} from "./profile";

describe("bucketTimeline", () => {
  it("returns [] for no timestamps", () => {
    expect(bucketTimeline([], { epoch: true })).toEqual([]);
  });

  it("buckets epoch seconds into evenly-spaced points with HH:MM labels", () => {
    // 24 events across one hour → 24 buckets, total preserved.
    const base = 1_700_000_000;
    const times = Array.from({ length: 24 }, (_, i) => base + i * 150);
    const tl = bucketTimeline(times, { epoch: true, buckets: 24 });
    expect(tl).toHaveLength(24);
    expect(tl.reduce((s, p) => s + p.packets, 0)).toBe(24);
    expect(tl[0].label).toMatch(/^\d{2}:\d{2}$/);
  });

  it("labels non-epoch (relative) times with ordinals", () => {
    const tl = bucketTimeline([0, 1, 2, 3], { epoch: false, buckets: 4 });
    expect(tl[0].label).toBe("1");
    expect(tl[3].label).toBe("4");
  });

  it("puts all same-instant events in one bucket", () => {
    const tl = bucketTimeline([5, 5, 5], { epoch: true, buckets: 6 });
    expect(tl[0].packets).toBe(3);
    expect(tl.reduce((s, p) => s + p.packets, 0)).toBe(3);
  });
});

describe("topTalkers", () => {
  it("ranks source IPs by count, descending, limited", () => {
    const t = topTalkers({ "10.0.0.1": 5, "10.0.0.2": 20, "10.0.0.3": 1 }, 2);
    expect(t).toEqual([
      { ip: "10.0.0.2", packets: 20 },
      { ip: "10.0.0.1", packets: 5 },
    ]);
  });
});

describe("topPorts", () => {
  it("ranks ports and annotates known services", () => {
    const p = topPorts({ 443: 100, 23: 50, 9999: 10 }, 3);
    expect(p[0]).toEqual({ port: 443, packets: 100, service: "HTTPS" });
    expect(p[1]).toEqual({ port: 23, packets: 50, service: "TELNET" });
    expect(p[2].service).toBeUndefined();
  });
});

describe("topConversations", () => {
  it("decodes src>dst keys, ranks by volume, drops self/malformed", () => {
    const counts = {
      [convKey("10.0.0.1", "10.0.0.9")]: 50,
      [convKey("10.0.0.2", "10.0.0.9")]: 80,
      [convKey("10.0.0.3", "10.0.0.3")]: 5, // self → dropped
      malformed: 99,
    };
    const r = topConversations(counts, 5);
    expect(r).toEqual([
      { src: "10.0.0.2", dst: "10.0.0.9", packets: 80 },
      { src: "10.0.0.1", dst: "10.0.0.9", packets: 50 },
    ]);
  });
});

describe("serviceName", () => {
  it("maps well-known ports and returns undefined otherwise", () => {
    expect(serviceName(22)).toBe("SSH");
    expect(serviceName(3389)).toBe("RDP");
    expect(serviceName(12345)).toBeUndefined();
  });
});
