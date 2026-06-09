import { describe, it, expect } from "vitest";
import { sniffScanner } from "./sniff";

describe("sniffScanner", () => {
  it("detects nessus by .nessus filename extension", () => {
    expect(sniffScanner("scan.nessus", "")).toBe("nessus");
  });

  it("detects nmap by .gnmap filename extension", () => {
    expect(sniffScanner("output.gnmap", "")).toBe("nmap");
  });

  it("detects burp by .burp filename extension", () => {
    expect(sniffScanner("export.burp", "")).toBe("burp");
  });

  it("detects zap by .json filename + alerts key", () => {
    expect(sniffScanner("report.json", '{"site": [], "alerts": []}')).toBe("zap");
  });

  it("detects zap by .json filename + site key", () => {
    expect(sniffScanner("zap-report.json", '{"site": [{"@name": "https://example.com"}]}')).toBe(
      "zap",
    );
  });

  it("detects nessus by <NessusClientData content marker", () => {
    expect(
      sniffScanner(
        "scan.xml",
        '<?xml version="1.0"?><NessusClientData_v2><Report name="test"></Report></NessusClientData_v2>',
      ),
    ).toBe("nessus");
  });

  it("detects nmap by <nmaprun content marker", () => {
    expect(sniffScanner("scan.xml", '<nmaprun scanner="nmap"><host></host></nmaprun>')).toBe(
      "nmap",
    );
  });

  it("detects nmap by <nmap content marker (case-insensitive)", () => {
    expect(sniffScanner("scan.xml", "<NMAPRUN></NMAPRUN>")).toBe("nmap");
  });

  it("detects openvas by <report + <results content markers", () => {
    expect(
      sniffScanner("scan.xml", "<report><results max='10'><result></result></results></report>"),
    ).toBe("openvas");
  });

  it("detects burp by <issues + <issue content markers", () => {
    expect(
      sniffScanner("export.xml", '<issues burpVersion="2023.10"><issue><name>XSS</name></issue></issues>'),
    ).toBe("burp");
  });

  it("detects nessus by Plugin ID content marker", () => {
    expect(sniffScanner("report.csv", "Plugin ID,CVE,Risk,Host\n12345,CVE-2024-1,High,10.0.0.1")).toBe(
      "nessus",
    );
  });

  it("detects nessus by NESSUS_ content marker", () => {
    expect(sniffScanner("data.txt", "NESSUS_ID=12345\nNESSUS_RISK=High")).toBe("nessus");
  });

  it("falls back to universal for empty content", () => {
    expect(sniffScanner("notes.txt", "")).toBe("universal");
  });

  it("falls back to universal for unrecognized content", () => {
    expect(sniffScanner("data.csv", "col1,col2\nval1,val2")).toBe("universal");
  });

  it("detects nessus by .nessus extension even with empty content", () => {
    expect(sniffScanner("path/to/scan.nessus", "")).toBe("nessus");
  });

  it("handles Windows-style path separators", () => {
    expect(sniffScanner("C:\\scans\\output.gnmap", "")).toBe("nmap");
  });
});
