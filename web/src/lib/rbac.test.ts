import { describe, it, expect } from "vitest";
import { can, canManage, canView } from "./rbac";
import {
  ANALYST_PERMISSIONS,
  MODULES,
  PERMISSIONS,
  PROTOTYPE_ROLE_MAP,
  ROLE_CODES,
  ROLES,
  type AccessLevel,
} from "./types/roles";
import { USERS } from "./fixtures";

const LEVELS: AccessLevel[] = ["full", "read", "own", "no"];

describe("rbac access matrix", () => {
  it("returns a valid access level for every role × module", () => {
    for (const role of ROLE_CODES) {
      for (const m of MODULES) {
        expect(LEVELS).toContain(can(role, m.id));
      }
    }
  });

  it("matches the prototype matrix on key cells", () => {
    expect(can("super", "users")).toBe("full");
    expect(can("t1", "users")).toBe("no");
    expect(can("head", "group")).toBe("full");
    expect(can("chief", "group")).toBe("no");
    expect(can("chief", "agent")).toBe("full");
    expect(can("super", "agent")).toBe("no"); // super does not use the field agent
    expect(can("lead", "finding")).toBe("own");
  });

  it("canView / canManage derive correctly", () => {
    expect(canView("head", "group")).toBe(true);
    expect(canView("chief", "group")).toBe(false);
    expect(canManage("super", "users")).toBe(true);
    expect(canManage("head", "users")).toBe(false); // head has "read"
  });

  it("unknown module is denied", () => {
    // @ts-expect-error — exercising the runtime guard with an invalid module
    expect(can("super", "nope")).toBe("no");
  });
});

describe("roles & permissions", () => {
  it("has exactly the 5 canonical roles", () => {
    expect([...ROLE_CODES]).toEqual(["super", "head", "chief", "lead", "t1"]);
    expect(ROLES.map((r) => r.code)).toEqual(["super", "head", "chief", "lead", "t1"]);
  });

  it("prototype role codes all map to canonical roles", () => {
    for (const canonical of Object.values(PROTOTYPE_ROLE_MAP)) {
      expect(ROLE_CODES).toContain(canonical);
    }
    expect(PROTOTYPE_ROLE_MAP.departament).toBe("super");
    expect(PROTOTYPE_ROLE_MAP.toifa1).toBe("t1");
  });

  it("analyst permissions are part of the catalog (analyst is not a role)", () => {
    for (const p of ANALYST_PERMISSIONS) {
      expect(PERMISSIONS).toContain(p);
    }
  });
});

describe("fixtures", () => {
  it("every seeded user has a canonical role code", () => {
    for (const u of USERS) {
      expect(ROLE_CODES).toContain(u.role);
    }
  });
});
