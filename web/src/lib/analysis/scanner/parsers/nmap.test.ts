import { describe, it, expect } from "vitest";
import { parseNmap } from "./nmap";

const MINI_NMAP_XML = `<?xml version="1.0" encoding="UTF-8"?>
<nmaprun scanner="nmap" start="1700000000" version="7.94">
  <host starttime="1700000000" endtime="1700000010">
    <status state="up" reason="echo-reply"/>
    <address addr="192.168.1.100" addrtype="ipv4"/>
    <hostnames>
      <hostname name="server01.local" type="PTR"/>
    </hostnames>
    <ports>
      <port protocol="tcp" portid="22">
        <state state="open" reason="syn-ack"/>
        <service name="ssh" product="OpenSSH" version="8.9"/>
      </port>
      <port protocol="tcp" portid="23">
        <state state="open" reason="syn-ack"/>
        <service name="telnet"/>
      </port>
      <port protocol="tcp" portid="80">
        <state state="closed" reason="reset"/>
        <service name="http"/>
      </port>
    </ports>
  </host>
</nmaprun>`;

describe("parseNmap", () => {
  it("returns 2 findings for 2 open ports (excludes closed port)", () => {
    const result = parseNmap(MINI_NMAP_XML);
    expect(result.findings).toHaveLength(2);
  });

  it("sets scanner type to nmap", () => {
    const result = parseNmap(MINI_NMAP_XML);
    expect(result.scanner).toBe("nmap");
  });

  it("counts 1 unique host", () => {
    const result = parseNmap(MINI_NMAP_XML);
    expect(result.hosts).toBe(1);
  });

  it("maps port 23 (telnet) → high severity", () => {
    const result = parseNmap(MINI_NMAP_XML);
    const telnet = result.findings.find((f) => f.port === "23");
    expect(telnet?.severity).toBe("high");
  });

  it("maps port 22 (ssh) → medium severity", () => {
    const result = parseNmap(MINI_NMAP_XML);
    const ssh = result.findings.find((f) => f.port === "22");
    expect(ssh?.severity).toBe("medium");
  });

  it("includes host IP in each finding", () => {
    const result = parseNmap(MINI_NMAP_XML);
    for (const f of result.findings) {
      expect(f.host).toBe("192.168.1.100");
    }
  });

  it("generates a title including port/protocol/service", () => {
    const result = parseNmap(MINI_NMAP_XML);
    const ssh = result.findings.find((f) => f.port === "22");
    expect(ssh?.title).toMatch(/22\/tcp/);
    expect(ssh?.title).toMatch(/ssh/i);
  });

  it("sets protocol on each finding", () => {
    const result = parseNmap(MINI_NMAP_XML);
    for (const f of result.findings) {
      expect(f.protocol).toBe("tcp");
    }
  });

  it("extracts scan date from start attribute", () => {
    const result = parseNmap(MINI_NMAP_XML);
    expect(result.scanDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns 0 findings and 0 hosts for empty nmaprun", () => {
    const xml = `<nmaprun scanner="nmap"></nmaprun>`;
    const result = parseNmap(xml);
    expect(result.findings).toHaveLength(0);
    expect(result.hosts).toBe(0);
  });

  it("assigns info severity to non-dangerous, script-less open port", () => {
    const xml = `<nmaprun>
      <host>
        <status state="up"/>
        <address addr="10.0.0.1" addrtype="ipv4"/>
        <ports>
          <port protocol="tcp" portid="12345">
            <state state="open"/>
            <service name="unknown"/>
          </port>
        </ports>
      </host>
    </nmaprun>`;
    const result = parseNmap(xml);
    expect(result.findings[0].severity).toBe("info");
  });

  it("assigns medium severity to port with scripts", () => {
    const xml = `<nmaprun>
      <host>
        <status state="up"/>
        <address addr="10.0.0.1" addrtype="ipv4"/>
        <ports>
          <port protocol="tcp" portid="9999">
            <state state="open"/>
            <service name="unknown"/>
            <script id="banner" output="Some banner text"/>
          </port>
        </ports>
      </host>
    </nmaprun>`;
    const result = parseNmap(xml);
    expect(result.findings[0].severity).toBe("medium");
  });

  it("assigns medium severity to FTP port 21", () => {
    const xml = `<nmaprun>
      <host>
        <status state="up"/>
        <address addr="10.0.0.1" addrtype="ipv4"/>
        <ports>
          <port protocol="tcp" portid="21">
            <state state="open"/>
            <service name="ftp"/>
          </port>
        </ports>
      </host>
    </nmaprun>`;
    const result = parseNmap(xml);
    expect(result.findings[0].severity).toBe("medium");
  });

  it("does not throw on malformed XML", () => {
    const result = parseNmap("not xml at all");
    expect(result.scanner).toBe("nmap");
    expect(result.findings).toHaveLength(0);
  });
});
