import { describe, it, expect } from "vitest";
import { parseBurp } from "./burp";

const MINI_BURP_XML = `<?xml version="1.0"?>
<issues burpVersion="2024.1" exportTime="Tue Jan 07 10:00:00 UTC 2025">
  <issue>
    <serialNumber>1</serialNumber>
    <type>1049088</type>
    <name>SQL injection</name>
    <host ip="192.168.1.50">https://target.example.com</host>
    <path>/login</path>
    <severity>High</severity>
    <confidence>Certain</confidence>
    <issueDetail>The parameter 'username' appears to be vulnerable to SQL injection.</issueDetail>
    <issueBackground>SQL injection is a technique used to attack data-driven applications.</issueBackground>
    <remediationDetail>Use parameterised queries in all database interactions.</remediationDetail>
  </issue>
  <issue>
    <serialNumber>2</serialNumber>
    <type>5244416</type>
    <name>Cross-site scripting (reflected)</name>
    <host ip="192.168.1.50">https://target.example.com</host>
    <path>/search</path>
    <severity>Critical</severity>
    <confidence>Firm</confidence>
    <issueDetail><![CDATA[The value of the <b>q</b> parameter is returned in the response.]]></issueDetail>
    <remediationBackground>Validate and encode all user-supplied data in HTML output.</remediationBackground>
  </issue>
  <issue>
    <serialNumber>3</serialNumber>
    <type>134217728</type>
    <name>Password field with autocomplete enabled</name>
    <host ip="10.0.0.1">http://internal.example.com</host>
    <path>/admin/login</path>
    <severity>Low</severity>
    <confidence>Certain</confidence>
    <issueDetail>The password field does not disable autocomplete.</issueDetail>
  </issue>
</issues>`;

describe("parseBurp", () => {
  it("returns 3 findings from mini XML with 3 issues", () => {
    const result = parseBurp(MINI_BURP_XML);
    expect(result.findings).toHaveLength(3);
  });

  it("sets scanner type to burp", () => {
    const result = parseBurp(MINI_BURP_XML);
    expect(result.scanner).toBe("burp");
  });

  it("maps severity High → high", () => {
    const result = parseBurp(MINI_BURP_XML);
    const finding = result.findings.find((f) => f.title?.startsWith("SQL injection"));
    expect(finding?.severity).toBe("high");
  });

  it("maps severity Critical → critical", () => {
    const result = parseBurp(MINI_BURP_XML);
    const finding = result.findings.find((f) => f.title?.startsWith("Cross-site scripting"));
    expect(finding?.severity).toBe("critical");
  });

  it("maps severity Low → low", () => {
    const result = parseBurp(MINI_BURP_XML);
    const finding = result.findings.find((f) => f.title?.startsWith("Password field"));
    expect(finding?.severity).toBe("low");
  });

  it("extracts IP from host tag attribute", () => {
    const result = parseBurp(MINI_BURP_XML);
    const finding = result.findings.find((f) => f.title?.startsWith("SQL injection"));
    expect(finding?.host).toBe("192.168.1.50");
  });

  it("extracts port from host URL", () => {
    const result = parseBurp(MINI_BURP_XML);
    const finding = result.findings.find((f) => f.title?.startsWith("SQL injection"));
    expect(finding?.port).toBe("443");
  });

  it("extracts protocol from host URL", () => {
    const result = parseBurp(MINI_BURP_XML);
    const finding = result.findings.find((f) => f.title?.startsWith("SQL injection"));
    expect(finding?.protocol).toBe("https");
  });

  it("includes confidence in title when present", () => {
    const result = parseBurp(MINI_BURP_XML);
    const finding = result.findings.find((f) => f.title?.startsWith("SQL injection"));
    expect(finding?.title).toContain("[Certain]");
  });

  it("strips CDATA markup from issueDetail", () => {
    const result = parseBurp(MINI_BURP_XML);
    const finding = result.findings.find((f) => f.title?.startsWith("Cross-site scripting"));
    expect(finding?.description).not.toContain("CDATA");
    expect(finding?.description).not.toMatch(/<[^>]*>/);
  });

  it("builds solution from remediationDetail", () => {
    const result = parseBurp(MINI_BURP_XML);
    const finding = result.findings.find((f) => f.title?.startsWith("SQL injection"));
    expect(finding?.solution).toContain("parameterised");
  });

  it("counts unique hosts", () => {
    const result = parseBurp(MINI_BURP_XML);
    expect(result.hosts).toBe(2);
  });

  it("returns empty result on empty string without throwing", () => {
    const result = parseBurp("");
    expect(result.scanner).toBe("burp");
    expect(result.findings).toHaveLength(0);
    expect(result.hosts).toBe(0);
  });

  it("returns empty result on malformed XML without throwing", () => {
    const result = parseBurp("<<<not xml at all>>>");
    expect(result.scanner).toBe("burp");
    expect(result.findings).toHaveLength(0);
  });

  it("maps severity Medium → medium", () => {
    const xml = `<issues>
      <issue>
        <name>Clickjacking</name>
        <host ip="10.0.0.5">https://another.example.com</host>
        <path>/</path>
        <severity>Medium</severity>
        <confidence>Firm</confidence>
        <issueDetail>Missing X-Frame-Options header.</issueDetail>
      </issue>
    </issues>`;
    const result = parseBurp(xml);
    expect(result.findings[0].severity).toBe("medium");
  });
});
