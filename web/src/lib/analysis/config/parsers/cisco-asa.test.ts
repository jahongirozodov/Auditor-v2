import { describe, it, expect } from "vitest";
import { parseCiscoAsa } from "./cisco-asa";

// Verbatim from the prototype (screens-tools.jsx lines 193-211). The prototype
// highlights lines 7/11/14/18 — this test locks that visual fidelity.
const FW_CORE_01 = `! ASA 9.16(4) — generated config
hostname FW-CORE-01
domain-name gov.uz
!
interface GigabitEthernet0/0
 nameif inside
 no security-level
 ip address 10.0.0.1 255.0.0.0
!
access-list INSIDE_IN extended permit ip 10.0.0.0 255.0.0.0 any
access-list INSIDE_IN extended permit tcp any any
access-group INSIDE_IN in interface inside
!
telnet 0.0.0.0 0.0.0.0 inside
ssh 10.20.4.0 255.255.255.0 inside
ssh version 2
logging buffered debugging
no logging trap`;

describe("parseCiscoAsa", () => {
  const res = parseCiscoAsa(FW_CORE_01);

  it("extracts hostname, model and firmware", () => {
    expect(res.vendor).toBe("cisco_asa");
    expect(res.hostname).toBe("FW-CORE-01");
    expect(res.model).toBe("Cisco ASA");
    expect(res.firmware).toBe("9.16(4)");
  });

  it("flags exactly the prototype's four highlighted lines", () => {
    expect(res.gaps.map((g) => g.line)).toEqual([7, 11, 14, 18]);
  });

  it("maps each gap to the right severity and CWE", () => {
    const byLine = Object.fromEntries(res.gaps.map((g) => [g.line, g]));
    expect(byLine[7]).toMatchObject({ severity: "critical", cwe: "CWE-1188" });
    expect(byLine[11]).toMatchObject({ severity: "critical", cwe: "CWE-284" });
    expect(byLine[14]).toMatchObject({ severity: "high", cwe: "CWE-319" });
    expect(byLine[18]).toMatchObject({ severity: "medium", cwe: "CWE-778" });
  });

  it("does not flag the permit-ip line (only the any-any rule)", () => {
    expect(res.gaps.some((g) => g.line === 10)).toBe(false);
  });

  it("carries the trimmed evidence line", () => {
    const g = res.gaps.find((x) => x.line === 7);
    expect(g?.evidenceLine).toBe("no security-level");
  });
});
