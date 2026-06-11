// @vitest-environment node
import { vi } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: { findUnique: vi.fn() },
    systemSetting: { findUnique: vi.fn() },
  },
}));

import { describe, it, expect } from "vitest";
import { SYSTEM_ROLE_DEFAULT_PERMISSIONS, hasPermission } from "./rbac.server";

describe("finding approval permissions", () => {
  it("lead has finding.approve", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.lead, "finding.approve")).toBe(true);
  });
  it("chief has finding.approve", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.chief, "finding.approve")).toBe(true);
  });
  it("head has finding.approve", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.head, "finding.approve")).toBe(true);
  });
  it("lead has finding.reject", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.lead, "finding.reject")).toBe(true);
  });
  it("chief has finding.reject", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.chief, "finding.reject")).toBe(true);
  });
  it("head has finding.reject", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.head, "finding.reject")).toBe(true);
  });
  it("t1 does NOT have finding.approve", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.t1, "finding.approve")).toBe(false);
  });
  it("t1 does NOT have finding.reject", () => {
    expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS.t1, "finding.reject")).toBe(false);
  });
  it("all roles keep finding.create", () => {
    for (const role of ["lead", "chief", "head", "t1"] as const) {
      expect(hasPermission(SYSTEM_ROLE_DEFAULT_PERMISSIONS[role], "finding.create")).toBe(true);
    }
  });
});
