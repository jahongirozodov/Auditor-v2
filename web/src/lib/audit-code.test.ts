// @vitest-environment node
import { describe, it, expect } from "vitest";
import { nextAuditCode } from "./audit-code";

describe("nextAuditCode", () => {
  it("starts at 001 when none exist for the year", () => {
    expect(nextAuditCode("2026", [])).toBe("AUD-2026-001");
    expect(nextAuditCode("2026", ["AUD-2025-014"])).toBe("AUD-2026-001");
  });
  it("increments past the max for the year and zero-pads", () => {
    expect(nextAuditCode("2026", ["AUD-2026-009", "AUD-2026-015", "AUD-2026-012"])).toBe(
      "AUD-2026-016",
    );
  });
  it("ignores other years and malformed codes", () => {
    expect(nextAuditCode("2026", ["AUD-2025-099", "AUD-2026-007", "garbage"])).toBe("AUD-2026-008");
  });
});
