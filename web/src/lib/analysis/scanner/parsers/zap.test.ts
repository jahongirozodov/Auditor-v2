import { describe, it, expect } from "vitest";
import { parseZap } from "./zap";

const MINI_ZAP_JSON = JSON.stringify({
  site: [
    {
      "@name": "https://example.com",
      alerts: [
        {
          name: "SQL Injection",
          riskdesc: "High (Medium)",
          desc: "<p>SQL injection vulnerability <b>found</b>.</p>",
          solution: "<p>Use <i>parameterised</i> queries.</p>",
          instances: [{ uri: "https://example.com/search?q=1" }],
        },
        {
          name: "X-Frame-Options Header Missing",
          riskdesc: "Medium (Low)",
          desc: "<p>The response does not include X-Frame-Options.</p>",
          solution: "<p>Set X-Frame-Options to DENY.</p>",
          instances: [{ uri: "https://example.com/home" }],
        },
        {
          name: "Cookie Without Secure Flag",
          riskdesc: "Low (Medium)",
          desc: "<p>Cookie missing Secure flag.</p>",
          instances: [{ uri: "https://example.com/" }],
        },
        {
          name: "Timestamp Disclosure",
          riskdesc: "Informational (Low)",
          desc: "<p>A timestamp was found in the response.</p>",
          instances: [{ uri: "https://example.com/about" }],
        },
      ],
    },
  ],
});

describe("parseZap", () => {
  it("returns 4 findings from mini JSON with 4 alerts", () => {
    const result = parseZap(MINI_ZAP_JSON);
    expect(result.findings).toHaveLength(4);
  });

  it("sets scanner type to zap", () => {
    const result = parseZap(MINI_ZAP_JSON);
    expect(result.scanner).toBe("zap");
  });

  it("maps riskdesc High → high", () => {
    const result = parseZap(MINI_ZAP_JSON);
    const finding = result.findings.find((f) => f.title === "SQL Injection");
    expect(finding?.severity).toBe("high");
  });

  it("maps riskdesc Medium → medium", () => {
    const result = parseZap(MINI_ZAP_JSON);
    const finding = result.findings.find((f) => f.title === "X-Frame-Options Header Missing");
    expect(finding?.severity).toBe("medium");
  });

  it("maps riskdesc Low → low", () => {
    const result = parseZap(MINI_ZAP_JSON);
    const finding = result.findings.find((f) => f.title === "Cookie Without Secure Flag");
    expect(finding?.severity).toBe("low");
  });

  it("maps riskdesc Informational → info", () => {
    const result = parseZap(MINI_ZAP_JSON);
    const finding = result.findings.find((f) => f.title === "Timestamp Disclosure");
    expect(finding?.severity).toBe("info");
  });

  it("strips HTML tags from description", () => {
    const result = parseZap(MINI_ZAP_JSON);
    const finding = result.findings.find((f) => f.title === "SQL Injection");
    expect(finding?.description).not.toMatch(/<[^>]*>/);
    expect(finding?.description).toContain("SQL injection vulnerability");
  });

  it("strips HTML tags from solution", () => {
    const result = parseZap(MINI_ZAP_JSON);
    const finding = result.findings.find((f) => f.title === "SQL Injection");
    expect(finding?.solution).not.toMatch(/<[^>]*>/);
    expect(finding?.solution).toContain("parameterised");
  });

  it("extracts host from instance URI", () => {
    const result = parseZap(MINI_ZAP_JSON);
    const finding = result.findings.find((f) => f.title === "SQL Injection");
    expect(finding?.host).toBe("example.com");
  });

  it("counts unique hosts", () => {
    const result = parseZap(MINI_ZAP_JSON);
    expect(result.hosts).toBeGreaterThan(0);
  });

  it("handles flat alerts format (top-level alerts array)", () => {
    const flat = JSON.stringify({
      alerts: [
        {
          name: "XSS",
          riskdesc: "High (High)",
          desc: "Cross-site scripting.",
          instances: [{ uri: "https://flat.example.com/page" }],
        },
      ],
    });
    const result = parseZap(flat);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].severity).toBe("high");
  });

  it("returns empty result on empty string without throwing", () => {
    const result = parseZap("");
    expect(result.scanner).toBe("zap");
    expect(result.findings).toHaveLength(0);
    expect(result.hosts).toBe(0);
  });

  it("returns empty result on malformed JSON without throwing", () => {
    const result = parseZap("{not valid json}");
    expect(result.scanner).toBe("zap");
    expect(result.findings).toHaveLength(0);
  });

  it("returns empty result on empty object without throwing", () => {
    const result = parseZap("{}");
    expect(result.scanner).toBe("zap");
    expect(result.findings).toHaveLength(0);
  });
});
