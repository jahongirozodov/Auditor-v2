import { describe, it, expect } from "vitest";
import { parseOpenVas } from "./openvas";

const MINI_OPENVAS_XML = `<?xml version="1.0"?>
<report>
  <scan_start>Tue Jan  7 10:00:00 2025</scan_start>
  <results>
    <result id="r1">
      <name>SSL/TLS: Certificate Expired</name>
      <description>The SSL/TLS certificate has expired.</description>
      <threat>High</threat>
      <severity>7.5</severity>
      <host>192.168.1.10</host>
      <port>443/tcp</port>
      <nvt oid="1.3.6.1.4.1.25623.1.0.103955">
        <name>SSL/TLS: Certificate Expired</name>
        <cvss_base>7.5</cvss_base>
        <cve>CVE-2023-1001</cve>
      </nvt>
    </result>
    <result id="r2">
      <name>Telnet Unencrypted Cleartext Login</name>
      <description>The remote host is running a Telnet service.</description>
      <threat>Critical</threat>
      <severity>9.8</severity>
      <host>192.168.1.20</host>
      <port>23/tcp</port>
      <nvt oid="1.3.6.1.4.1.25623.1.0.900430">
        <name>Telnet Unencrypted Cleartext Login</name>
        <cvss_base>9.8</cvss_base>
        <cve>CVE-2023-2002</cve>
      </nvt>
    </result>
  </results>
</report>`;

describe("parseOpenVas", () => {
  it("returns 2 findings from mini XML with 2 results", () => {
    const result = parseOpenVas(MINI_OPENVAS_XML);
    expect(result.findings).toHaveLength(2);
  });

  it("sets scanner type to openvas", () => {
    const result = parseOpenVas(MINI_OPENVAS_XML);
    expect(result.scanner).toBe("openvas");
  });

  it("maps severity 7.5 → high", () => {
    const result = parseOpenVas(MINI_OPENVAS_XML);
    const finding = result.findings.find((f) => f.host === "192.168.1.10");
    expect(finding?.severity).toBe("high");
  });

  it("maps severity 9.8 → critical", () => {
    const result = parseOpenVas(MINI_OPENVAS_XML);
    const finding = result.findings.find((f) => f.host === "192.168.1.20");
    expect(finding?.severity).toBe("critical");
  });

  it("extracts host correctly for each finding", () => {
    const result = parseOpenVas(MINI_OPENVAS_XML);
    const hosts = result.findings.map((f) => f.host);
    expect(hosts).toContain("192.168.1.10");
    expect(hosts).toContain("192.168.1.20");
  });

  it("extracts port and protocol from port field", () => {
    const result = parseOpenVas(MINI_OPENVAS_XML);
    const finding = result.findings.find((f) => f.host === "192.168.1.10");
    expect(finding?.port).toBe("443");
    expect(finding?.protocol).toBe("tcp");
  });

  it("counts 2 unique hosts", () => {
    const result = parseOpenVas(MINI_OPENVAS_XML);
    expect(result.hosts).toBe(2);
  });

  it("extracts CVE from nvt block", () => {
    const result = parseOpenVas(MINI_OPENVAS_XML);
    const finding = result.findings.find((f) => f.host === "192.168.1.10");
    expect(finding?.cve).toEqual(["CVE-2023-1001"]);
  });

  it("extracts CVSS score", () => {
    const result = parseOpenVas(MINI_OPENVAS_XML);
    const finding = result.findings.find((f) => f.host === "192.168.1.10");
    expect(finding?.cvss).toBe(7.5);
  });

  it("extracts scan date", () => {
    const result = parseOpenVas(MINI_OPENVAS_XML);
    expect(result.scanDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("uses threat string when severity element is absent", () => {
    const xml = `<report>
      <results>
        <result id="r3">
          <name>Medium threat finding</name>
          <description>Some medium issue.</description>
          <threat>Medium</threat>
          <host>10.0.0.1</host>
          <port>80/tcp</port>
        </result>
      </results>
    </report>`;
    const result = parseOpenVas(xml);
    expect(result.findings[0].severity).toBe("medium");
  });

  it("maps threat Low → low", () => {
    const xml = `<report><results>
      <result id="r4">
        <name>Low threat</name>
        <description>Minor issue.</description>
        <threat>Low</threat>
        <host>10.0.0.2</host>
        <port>8080/tcp</port>
      </result>
    </results></report>`;
    const result = parseOpenVas(xml);
    expect(result.findings[0].severity).toBe("low");
  });

  it("skips general/tcp port and leaves port undefined", () => {
    const xml = `<report><results>
      <result id="r5">
        <name>General finding</name>
        <description>General issue.</description>
        <threat>High</threat>
        <host>10.0.0.3</host>
        <port>general/tcp</port>
      </result>
    </results></report>`;
    const result = parseOpenVas(xml);
    expect(result.findings[0].port).toBeUndefined();
    expect(result.findings[0].protocol).toBeUndefined();
  });

  it("returns empty result on empty string without throwing", () => {
    const result = parseOpenVas("");
    expect(result.scanner).toBe("openvas");
    expect(result.findings).toHaveLength(0);
    expect(result.hosts).toBe(0);
  });

  it("returns empty result on malformed input without throwing", () => {
    const result = parseOpenVas("<<<not xml>>>");
    expect(result.scanner).toBe("openvas");
    expect(result.findings).toHaveLength(0);
  });
});
