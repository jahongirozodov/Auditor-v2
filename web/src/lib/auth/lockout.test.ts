// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/prisma", () => ({ prisma: {} }));

import { isLocked, nextLock } from "./lockout";

describe("isLocked", () => {
  const now = new Date("2026-06-09T12:00:00Z");
  it("is false with no lock", () => {
    expect(isLocked(null, now)).toBe(false);
  });
  it("is false once the lock has expired", () => {
    expect(isLocked(new Date("2026-06-09T11:59:00Z"), now)).toBe(false);
  });
  it("is true while the lock is in the future", () => {
    expect(isLocked(new Date("2026-06-09T12:05:00Z"), now)).toBe(true);
  });
});

describe("nextLock", () => {
  const now = new Date("2026-06-09T12:00:00Z");
  it("returns null below the threshold", () => {
    expect(nextLock(4, now)).toBeNull();
  });
  it("locks at/above the threshold (default 5 → +15min)", () => {
    const until = nextLock(5, now);
    expect(until).not.toBeNull();
    expect(until!.getTime()).toBe(now.getTime() + 15 * 60_000);
  });
});
