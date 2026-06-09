import { describe, it, expect } from "vitest";
import { parseNessus } from "./nessus";

const MINI_NESSUS_XML = `<?xml version="1.0" ?>
<NessusClientData_v2>
  <Report name="Test Scan">
    <ReportHost name="192.168.1.1">
      <ReportItem port="443" protocol="tcp" severity="3" pluginName="SSL Certificate Expiry" pluginID="55000">
        <description>The SSL certificate on this host has expired.</description>
        <solution>Renew the SSL certificate immediately.</solution>
        <cve>CVE-2024-1111</cve>
        <cvss_base_score>7.5</cvss_base_score>
        <plugin_output>Certificate expires: 2023-01-01</plugin_output>
      </ReportItem>
      <ReportItem port="80" protocol="tcp" severity="2" pluginName="HTTP TRACE Method Enabled" pluginID="55001">
        <description>The HTTP TRACE method is enabled on this server.</description>
        <solution>Disable the HTTP TRACE method.</solution>
        <cve>CVE-2024-2222</cve>
        <cvss_base_score>5.0</cvss_base_score>
      </ReportItem>
    </ReportHost>
  </Report>
</NessusClientData_v2>`;

describe("parseNessus", () => {
  it("returns 2 findings from mini XML with 1 host and 2 ReportItems", () => {
    const result = parseNessus(MINI_NESSUS_XML);
    expect(result.findings).toHaveLength(2);
  });

  it("maps severity 3 → high", () => {
    const result = parseNessus(MINI_NESSUS_XML);
    const finding = result.findings.find((f) => f.pluginId === "55000");
    expect(finding?.severity).toBe("high");
  });

  it("maps severity 2 → medium", () => {
    const result = parseNessus(MINI_NESSUS_XML);
    const finding = result.findings.find((f) => f.pluginId === "55001");
    expect(finding?.severity).toBe("medium");
  });

  it("extracts host correctly", () => {
    const result = parseNessus(MINI_NESSUS_XML);
    expect(result.findings[0].host).toBe("192.168.1.1");
    expect(result.findings[1].host).toBe("192.168.1.1");
  });

  it("counts 1 unique host", () => {
    const result = parseNessus(MINI_NESSUS_XML);
    expect(result.hosts).toBe(1);
  });

  it("sets scanner type to nessus", () => {
    const result = parseNessus(MINI_NESSUS_XML);
    expect(result.scanner).toBe("nessus");
  });

  it("extracts CVE list", () => {
    const result = parseNessus(MINI_NESSUS_XML);
    const finding = result.findings.find((f) => f.pluginId === "55000");
    expect(finding?.cve).toEqual(["CVE-2024-1111"]);
  });

  it("extracts CVSS score", () => {
    const result = parseNessus(MINI_NESSUS_XML);
    const finding = result.findings.find((f) => f.pluginId === "55000");
    expect(finding?.cvss).toBe(7.5);
  });

  it("extracts title from pluginName", () => {
    const result = parseNessus(MINI_NESSUS_XML);
    const finding = result.findings.find((f) => f.pluginId === "55000");
    expect(finding?.title).toBe("SSL Certificate Expiry");
  });

  it("extracts solution", () => {
    const result = parseNessus(MINI_NESSUS_XML);
    const finding = result.findings.find((f) => f.pluginId === "55000");
    expect(finding?.solution).toBe("Renew the SSL certificate immediately.");
  });

  it("extracts pluginOutput", () => {
    const result = parseNessus(MINI_NESSUS_XML);
    const finding = result.findings.find((f) => f.pluginId === "55000");
    expect(finding?.pluginOutput).toBe("Certificate expires: 2023-01-01");
  });

  it("extracts port and protocol", () => {
    const result = parseNessus(MINI_NESSUS_XML);
    const finding = result.findings.find((f) => f.pluginId === "55000");
    expect(finding?.port).toBe("443");
    expect(finding?.protocol).toBe("tcp");
  });

  it("handles multiple hosts correctly", () => {
    const xml = `<NessusClientData_v2><Report name="Multi">
      <ReportHost name="10.0.0.1">
        <ReportItem port="22" protocol="tcp" severity="1" pluginName="SSH" pluginID="1">
          <description>SSH running.</description>
        </ReportItem>
      </ReportHost>
      <ReportHost name="10.0.0.2">
        <ReportItem port="23" protocol="tcp" severity="4" pluginName="Telnet" pluginID="2">
          <description>Telnet running.</description>
        </ReportItem>
      </ReportHost>
    </Report></NessusClientData_v2>`;
    const result = parseNessus(xml);
    expect(result.hosts).toBe(2);
    expect(result.findings).toHaveLength(2);
    expect(result.findings.find((f) => f.pluginId === "2")?.severity).toBe("critical");
    expect(result.findings.find((f) => f.pluginId === "1")?.severity).toBe("low");
  });

  it("maps severity 0 → info", () => {
    const xml = `<NessusClientData_v2><Report name="Info">
      <ReportHost name="10.0.0.1">
        <ReportItem port="0" protocol="tcp" severity="0" pluginName="Ping" pluginID="99">
          <description>Host is alive.</description>
        </ReportItem>
      </ReportHost>
    </Report></NessusClientData_v2>`;
    const result = parseNessus(xml);
    expect(result.findings[0].severity).toBe("info");
  });

  it("returns empty result on invalid XML without throwing", () => {
    const result = parseNessus("this is not valid xml at all <<<>>>");
    expect(result.scanner).toBe("nessus");
    expect(result.findings).toHaveLength(0);
    expect(result.hosts).toBe(0);
  });

  it("returns empty result on empty string without throwing", () => {
    const result = parseNessus("");
    expect(result.scanner).toBe("nessus");
    expect(result.findings).toHaveLength(0);
  });
});
