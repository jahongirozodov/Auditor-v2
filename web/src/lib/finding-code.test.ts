// @vitest-environment node
import { describe, it, expect } from "vitest";
import { nextFindingCode } from "./finding-code";

describe("nextFindingCode", () => {
  it("starts at 0001 when none exist for the year", () => {
    expect(nextFindingCode("2026", [])).toBe("F-2026-0001");
    expect(nextFindingCode("2026", ["F-2025-0099"])).toBe("F-2026-0001");
  });
  it("increments past the max for the year and 4-pads", () => {
    expect(nextFindingCode("2026", ["F-2026-0341", "F-2026-0350", "F-2026-0347"])).toBe(
      "F-2026-0351",
    );
  });
  it("ignores other years and malformed codes", () => {
    expect(nextFindingCode("2026", ["F-2025-9999", "F-2026-0007", "garbage"])).toBe("F-2026-0008");
  });
});
