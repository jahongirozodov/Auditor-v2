import { describe, it, expect } from "vitest";
import { parseUniversal } from "./universal";

const CSV_STANDARD = `title,severity,description,host,solution
SQL Injection,High,Parameter is vulnerable to SQL injection,192.168.1.1,Use parameterised queries
XSS Reflected,Medium,Cross-site scripting found,192.168.1.2,Encode output
Open Port 23,Low,Telnet port is open,10.0.0.5,Close the port`;

const CSV_ALTERNATIVE = `name,risk,desc,ip,fix
Weak Password Policy,high,Passwords do not meet complexity requirements,10.0.0.10,Enforce strong password policy
Default Credentials,critical,Default credentials are in use,10.0.0.11,Change default credentials immediately`;

const CSV_NO_RECOGNIZED_HEADERS = `foo,bar,baz
value1,value2,value3
value4,value5,value6`;

describe("parseUniversal", () => {
  describe("standard headers (title, severity, description, host)", () => {
    it("returns 3 findings from standard CSV", () => {
      const result = parseUniversal(CSV_STANDARD);
      expect(result.findings).toHaveLength(3);
    });

    it("sets scanner type to universal", () => {
      const result = parseUniversal(CSV_STANDARD);
      expect(result.scanner).toBe("universal");
    });

    it("maps severity High → high", () => {
      const result = parseUniversal(CSV_STANDARD);
      const finding = result.findings.find((f) => f.title === "SQL Injection");
      expect(finding?.severity).toBe("high");
    });

    it("maps severity Medium → medium", () => {
      const result = parseUniversal(CSV_STANDARD);
      const finding = result.findings.find((f) => f.title === "XSS Reflected");
      expect(finding?.severity).toBe("medium");
    });

    it("maps severity Low → low", () => {
      const result = parseUniversal(CSV_STANDARD);
      const finding = result.findings.find((f) => f.title === "Open Port 23");
      expect(finding?.severity).toBe("low");
    });

    it("extracts title correctly", () => {
      const result = parseUniversal(CSV_STANDARD);
      expect(result.findings[0].title).toBe("SQL Injection");
    });

    it("extracts description correctly", () => {
      const result = parseUniversal(CSV_STANDARD);
      const finding = result.findings.find((f) => f.title === "SQL Injection");
      expect(finding?.description).toContain("SQL injection");
    });

    it("extracts host correctly", () => {
      const result = parseUniversal(CSV_STANDARD);
      const finding = result.findings.find((f) => f.title === "SQL Injection");
      expect(finding?.host).toBe("192.168.1.1");
    });

    it("counts unique hosts", () => {
      const result = parseUniversal(CSV_STANDARD);
      expect(result.hosts).toBe(3);
    });
  });

  describe("alternative header names (name, risk, desc, ip)", () => {
    it("returns 2 findings from alternative CSV", () => {
      const result = parseUniversal(CSV_ALTERNATIVE);
      expect(result.findings).toHaveLength(2);
    });

    it("detects name column as title", () => {
      const result = parseUniversal(CSV_ALTERNATIVE);
      expect(result.findings[0].title).toBe("Weak Password Policy");
    });

    it("detects risk column as severity and maps high → high", () => {
      const result = parseUniversal(CSV_ALTERNATIVE);
      const finding = result.findings.find((f) => f.title === "Weak Password Policy");
      expect(finding?.severity).toBe("high");
    });

    it("detects risk column and maps critical → critical", () => {
      const result = parseUniversal(CSV_ALTERNATIVE);
      const finding = result.findings.find((f) => f.title === "Default Credentials");
      expect(finding?.severity).toBe("critical");
    });

    it("detects ip column as host", () => {
      const result = parseUniversal(CSV_ALTERNATIVE);
      const finding = result.findings.find((f) => f.title === "Weak Password Policy");
      expect(finding?.host).toBe("10.0.0.10");
    });

    it("detects desc column as description", () => {
      const result = parseUniversal(CSV_ALTERNATIVE);
      const finding = result.findings.find((f) => f.title === "Weak Password Policy");
      expect(finding?.description).toContain("complexity");
    });
  });

  describe("no recognized headers", () => {
    it("returns a single info finding when no headers recognized", () => {
      const result = parseUniversal(CSV_NO_RECOGNIZED_HEADERS);
      expect(result.findings).toHaveLength(1);
      expect(result.findings[0].severity).toBe("info");
    });

    it("scanner is still universal", () => {
      const result = parseUniversal(CSV_NO_RECOGNIZED_HEADERS);
      expect(result.scanner).toBe("universal");
    });

    it("returns 0 hosts when no host column recognized", () => {
      const result = parseUniversal(CSV_NO_RECOGNIZED_HEADERS);
      expect(result.hosts).toBe(0);
    });
  });

  describe("empty string input", () => {
    it("returns a valid result and never throws", () => {
      const result = parseUniversal("");
      expect(result.scanner).toBe("universal");
      expect(result.findings).toHaveLength(1);
      expect(result.findings[0].severity).toBe("info");
    });

    it("returns 0 hosts on empty input", () => {
      const result = parseUniversal("");
      expect(result.hosts).toBe(0);
    });
  });

  it("handles quoted CSV fields correctly", () => {
    const csv = `title,severity,description,host
"SQL Injection, advanced",High,"Parameter is vulnerable, use prepared statements",192.168.2.1`;
    const result = parseUniversal(csv);
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0].title).toBe("SQL Injection, advanced");
    expect(result.findings[0].description).toContain("prepared statements");
  });

  it("never throws on completely malformed input", () => {
    expect(() => parseUniversal(";\x00\x01\x02")).not.toThrow();
  });
});
