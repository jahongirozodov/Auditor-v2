import { describe, it, expect } from "vitest";
import { analyzeConfig } from "./index";

describe("analyzeConfig", () => {
  it("dispatches to the Cisco ASA parser and finds gaps", () => {
    const cfg =
      "! ASA 9.16(4)\nhostname FW-CORE-01\ninterface Gi0/0\n nameif inside\n no security-level\ntelnet 0.0.0.0 0.0.0.0 inside";
    const res = analyzeConfig("fw-core-01.cfg", cfg);
    expect(res.vendor).toBe("cisco_asa");
    expect(res.hostname).toBe("FW-CORE-01");
    expect(res.gaps.length).toBeGreaterThanOrEqual(2);
  });

  it("returns a zero-gap result for unknown content, hostname from filename", () => {
    const res = analyzeConfig("notes.txt", "just random notes");
    expect(res.vendor).toBe("unknown");
    expect(res.gaps).toEqual([]);
    expect(res.hostname).toBe("notes");
  });

  it("falls back to the filename basename when the parser finds no hostname", () => {
    const res = analyzeConfig("/etc/ssh/sshd_config", "PermitRootLogin yes");
    expect(res.vendor).toBe("linux_sshd");
    expect(res.hostname).toBe("sshd_config");
  });
});
