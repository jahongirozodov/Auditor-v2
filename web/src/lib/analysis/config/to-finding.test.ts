import { describe, it, expect } from "vitest";
import { gapToFindingInput, CONFIG_FINDING_TYPE } from "./to-finding";
import type { ConfigGap } from "./types";

const gap: ConfigGap = {
  line: 7,
  severity: "critical",
  title: "Interfeysda xavfsizlik darajasi belgilanmagan",
  description: "Segmentatsiya buzilgan.",
  cwe: "CWE-1188",
  recommendation: "security-level belgilang.",
  evidenceLine: "no security-level",
};

describe("gapToFindingInput", () => {
  it("maps severity → CVSS and the fixed finding type", () => {
    const out = gapToFindingInput(gap, { auditId: "AUD-1", taskId: "T-1", asset: "FW-CORE-01" });
    expect(out).toMatchObject({
      auditId: "AUD-1",
      taskId: "T-1",
      title: gap.title,
      severity: "critical",
      cvss: 9.1,
      cwe: "CWE-1188",
      asset: "FW-CORE-01",
      type: CONFIG_FINDING_TYPE,
    });
  });

  it("composes the description with recommendation and evidence line", () => {
    const out = gapToFindingInput(gap, { auditId: "AUD-1", taskId: "T-1", asset: "FW" });
    expect(out.description).toContain("Tavsiya: security-level belgilang.");
    expect(out.description).toContain("Satr 7: no security-level");
  });

  it("weaves in an AI note when provided", () => {
    const out = gapToFindingInput(gap, {
      auditId: "A",
      taskId: "T",
      asset: "x",
      aiNote: "AI izoh.",
    });
    expect(out.description).toContain("AI izoh.");
  });

  it("omits the evidence line for whole-file (absence) gaps", () => {
    const out = gapToFindingInput(
      { ...gap, line: 0, evidenceLine: "" },
      { auditId: "A", taskId: "T", asset: "x" },
    );
    expect(out.description).not.toContain("Satr");
  });
});
