// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  users: new Map<string, { role: string; customRoleCode: string | null }>(),
  settings: new Map<string, { value: unknown }>(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(async ({ where }: { where: { id: string } }) => h.users.get(where.id) ?? null),
    },
    systemSetting: {
      findUnique: vi.fn(async ({ where }: { where: { key: string } }) => h.settings.get(where.key) ?? null),
    },
  },
}));

import {
  deriveAccessForModule,
  getEffectivePermissionsForUser,
  hasPermission,
  normalizePermissionList,
} from "./rbac.server";

beforeEach(() => {
  h.users.clear();
  h.settings.clear();
});

describe("server RBAC resolver", () => {
  it("resolves super to wildcard permissions", async () => {
    h.users.set("u1", { role: "super", customRoleCode: null });

    const permissions = await getEffectivePermissionsForUser("u1");

    expect(permissions).toEqual(["*"]);
    expect(hasPermission(permissions, "system.settings")).toBe(true);
    expect(hasPermission(permissions, "traffic.upload")).toBe(true);
  });

  it("uses a custom role permission set when the user has a matching customRoleCode", async () => {
    h.users.set("u2", { role: "head", customRoleCode: "scanner_only" });
    h.settings.set("custom_roles", {
      value: [
        {
          code: "scanner_only",
          name: "Scanner operator",
          baseRole: "head",
          permissions: ["scanner.import"],
        },
      ],
    });

    const permissions = await getEffectivePermissionsForUser("u2");

    expect(permissions).toEqual(["scanner.import"]);
    expect(hasPermission(permissions, "scanner.import")).toBe(true);
    expect(hasPermission(permissions, "traffic.upload")).toBe(false);
  });

  it("uses persisted system role overrides before built-in defaults", async () => {
    h.users.set("u3", { role: "lead", customRoleCode: null });
    h.settings.set("system_role_permissions", {
      value: {
        lead: ["ai.use"],
      },
    });

    const permissions = await getEffectivePermissionsForUser("u3");

    expect(permissions).toEqual(["ai.use"]);
    expect(hasPermission(permissions, "ai.use")).toBe(true);
    expect(hasPermission(permissions, "config.upload")).toBe(false);
  });

  it("drops duplicate and unknown permission ids", () => {
    expect(normalizePermissionList(["ai.use", "nope", "ai.use", "traffic.upload"])).toEqual([
      "ai.use",
      "traffic.upload",
    ]);
  });

  it("derives matrix access from module permissions", () => {
    expect(deriveAccessForModule(["org.view_own"], "org")).toBe("own");
    expect(deriveAccessForModule(["org.view_all"], "org")).toBe("read");
    expect(deriveAccessForModule(["org.create", "org.update"], "org")).toBe("full");
    expect(deriveAccessForModule(["scanner.import"], "config")).toBe("read");
    expect(deriveAccessForModule([], "report")).toBe("no");
  });
});
