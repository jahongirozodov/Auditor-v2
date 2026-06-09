// @vitest-environment node
import { describe, it, expect } from "vitest";
import { nextTaskCode } from "./task-code";

describe("nextTaskCode", () => {
  it("starts at T-1 when none exist", () => {
    expect(nextTaskCode([])).toBe("T-1");
  });
  it("increments past the max (unpadded)", () => {
    expect(nextTaskCode(["T-114", "T-125", "T-120"])).toBe("T-126");
  });
  it("ignores malformed and non-task codes", () => {
    expect(nextTaskCode(["T-007", "AUD-2026-014", "garbage", "T-"])).toBe("T-8");
  });
});
