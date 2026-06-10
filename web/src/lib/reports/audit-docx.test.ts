// @vitest-environment node
import { describe, it, expect } from "vitest";
import { buildAuditDocx, REPORT_SECTIONS, type ReportSection } from "./audit-docx";
import type { AuditReportData } from "./audit-report-data";

const DATA: AuditReportData = {
  audit: {
    code: "AUD-2026-014",
    title: "Yillik kompleks audit",
    org: "Aloqa vazirligi",
    type: "Kompleks",
    status: "in_progress",
    stage: 4,
    startDate: "2026-06-01",
    endDate: "2026-07-20",
    leader: "Bobur Mirzayev",
    findings: { critical: 2, high: 5, medium: 8, low: 4 },
    tasks: { total: 26, done: 24, in_progress: 1, blocked: 0, new: 1 },
  },
  members: [{ name: "Dilshoda Rasulova", title: "Tahlilchi" }],
  findings: [{ title: "SQL injection", severity: "critical", asset: "web-01", cwe: "CWE-89", status: "approved" }],
  ai: {
    executiveSummary: "Audit yuqori xavfli.",
    overallRisk: "high",
    topRisks: [{ title: "SQLi", severity: "critical", why: "ochiq", recommendation: "parametrlash" }],
    remediationPlan: [{ priority: "high", action: "Patch qiling" }],
    kpiNote: "KPI yaxshi.",
  },
  topology: { summary: "Segmentatsiya zaif.", overallRisk: "high" },
  evidence: [{ name: "scan.pdf", comment: "Nessus" }],
  kpi: { taskCompletion: 92, findingResolution: 50, findingTotal: 4, findingResolved: 2 },
};

// A .docx is a zip — its bytes start with the local-file-header magic "PK\x03\x04".
function isZip(buf: Buffer): boolean {
  return buf[0] === 0x50 && buf[1] === 0x4b && buf[2] === 0x03 && buf[3] === 0x04;
}

describe("buildAuditDocx", () => {
  it("produces a non-empty .docx (zip) for all sections", async () => {
    const buf = await buildAuditDocx(DATA, [...REPORT_SECTIONS]);
    expect(buf.length).toBeGreaterThan(0);
    expect(isZip(buf)).toBe(true);
  });

  it("builds with a single section without throwing", async () => {
    const buf = await buildAuditDocx(DATA, ["overview"]);
    expect(isZip(buf)).toBe(true);
  });

  it("tolerates missing AI / topology / evidence", async () => {
    const bare: AuditReportData = {
      ...DATA,
      ai: null,
      topology: null,
      evidence: [],
      findings: [],
      members: [],
    };
    const sections: ReportSection[] = ["exec", "remediation", "topology", "findings", "appendix"];
    const buf = await buildAuditDocx(bare, sections);
    expect(isZip(buf)).toBe(true);
  });
});
