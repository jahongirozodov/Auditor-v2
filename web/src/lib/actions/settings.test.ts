// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  canManage: true,
  canRoleManage: true,
  system: null as null | { value: Record<string, unknown> },
  customRoles: null as null | { value: unknown[] },
  rolePermissions: null as null | { value: Record<string, unknown> },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u1", role: "super", name: "" })),
}));
vi.mock("@/lib/rbac", () => ({ canManage: vi.fn(() => h.canManage) }));
vi.mock("@/lib/rbac.server", () => ({
  requireAnyPermission: vi.fn(async () => h.canRoleManage),
  normalizePermissionList: (values: unknown) =>
    Array.isArray(values)
      ? values.filter((v, i, a) => typeof v === "string" && a.indexOf(v) === i)
      : [],
}));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    systemSetting: {
      findUnique: vi.fn(async ({ where }: { where: { key: string } }) =>
        where.key === "custom_roles"
          ? h.customRoles
          : where.key === "system_role_permissions"
            ? h.rolePermissions
            : h.system,
      ),
      upsert: vi.fn(async () => ({})),
    },
    kpiRule: { update: vi.fn(async () => ({})) },
    auditLog: { create: vi.fn(async () => ({})) },
    $transaction: vi.fn(),
  };
  prisma.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === "function"
      ? (arg as (tx: typeof prisma) => unknown)(prisma)
      : Promise.all(arg as unknown[]),
  );
  return { prisma };
});

import {
  saveSettings,
  saveKpiRules,
  testOllama,
  addCustomRole,
  updateCustomRole,
  deleteCustomRole,
  saveRolePermissions,
} from "./settings";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mock = prisma as any;

beforeEach(() => {
  vi.clearAllMocks();
  h.canManage = true;
  h.canRoleManage = true;
  h.system = null;
  h.customRoles = null;
  h.rolePermissions = null;
});

describe("saveSettings", () => {
  it("persists only known keys for the section and logs it", async () => {
    const res = await saveSettings({
      section: "general",
      values: { deptName: "Yangi nom", junk: "drop-me" },
    });
    expect(res).toEqual({ ok: true });
    const upsertArg = mock.systemSetting.upsert.mock.calls[0][0];
    expect(upsertArg.create.value.general.deptName).toBe("Yangi nom");
    expect(upsertArg.create.value.general).not.toHaveProperty("junk");
    const logActions = mock.auditLog.create.mock.calls.map(
      (c: [{ data: { action: string } }]) => c[0].data.action,
    );
    expect(logActions).toContain("settings.update");
  });

  it("forbids a non-admin", async () => {
    h.canManage = false;
    h.canRoleManage = false;
    expect(await saveSettings({ section: "ai", values: {} })).toEqual({
      ok: false,
      error: "forbidden",
    });
  });

  it("rejects an unknown section", async () => {
    // @ts-expect-error invalid section
    expect(await saveSettings({ section: "nope", values: {} })).toEqual({
      ok: false,
      error: "invalid",
    });
  });
});

describe("saveKpiRules", () => {
  it("updates each rule's points", async () => {
    const res = await saveKpiRules({
      rules: [
        { code: "task_completed", points: 6 },
        { code: "task_overdue", points: -6 },
      ],
    });
    expect(res).toEqual({ ok: true });
    expect(mock.kpiRule.update).toHaveBeenCalledTimes(2);
  });

  it("forbids a non-admin", async () => {
    h.canManage = false;
    h.canRoleManage = false;
    expect(await saveKpiRules({ rules: [] })).toEqual({ ok: false, error: "forbidden" });
  });
});

describe("testOllama", () => {
  it("returns ok with the model when the endpoint responds", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true }));
    const res = await testOllama();
    expect(res.ok).toBe(true);
    expect(res.model).toBeTruthy();
  });

  it("degrades to unreachable when the fetch throws", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("ECONNREFUSED")));
    expect(await testOllama()).toEqual({ ok: false, error: "unreachable" });
  });
});

describe("custom roles", () => {
  it("adds a new role", async () => {
    const res = await addCustomRole({ name: "Tashqi auditor", code: "ext_auditor", base: "—" });
    expect(res).toEqual({ ok: true });
    expect(mock.systemSetting.upsert).toHaveBeenCalled();
  });

  it("rejects a duplicate code", async () => {
    h.customRoles = {
      value: [{ name: "x", code: "ext_auditor", base: "—", perms: 0, tone: "tag--info" }],
    };
    expect(await addCustomRole({ name: "Yana", code: "ext_auditor" })).toEqual({
      ok: false,
      error: "duplicate",
    });
  });

  it("deletes a role by code", async () => {
    h.customRoles = {
      value: [{ name: "x", code: "observer", base: "—", perms: 0, tone: "tag--ghost" }],
    };
    expect(await deleteCustomRole({ code: "observer" })).toEqual({ ok: true });
    expect(mock.systemSetting.upsert).toHaveBeenCalled();
  });

  it("updates a role permission set by code", async () => {
    h.customRoles = {
      value: [
        {
          name: "Scanner operator",
          code: "scanner_operator",
          baseRole: "t1",
          permissions: ["scanner.import"],
          tone: "tag--info",
        },
      ],
    };
    expect(
      await updateCustomRole({
        name: "Scanner operator",
        code: "scanner_operator",
        baseRole: "lead",
        permissions: ["scanner.import", "ai.use"],
      }),
    ).toEqual({ ok: true });

    const upsertArg = mock.systemSetting.upsert.mock.calls[0][0];
    expect(upsertArg.create.value[0]).toMatchObject({
      code: "scanner_operator",
      baseRole: "lead",
      permissions: ["scanner.import", "ai.use"],
    });
  });
});

describe("permission management", () => {
  it("adds a custom role with a real permission set", async () => {
    const res = await addCustomRole({
      name: "Scanner operator",
      code: "scanner_operator",
      baseRole: "lead",
      permissions: ["scanner.import", "ai.use"],
    });

    expect(res).toEqual({ ok: true });
    const upsertArg = mock.systemSetting.upsert.mock.calls[0][0];
    expect(upsertArg.create.value[0]).toMatchObject({
      code: "scanner_operator",
      baseRole: "lead",
      permissions: ["scanner.import", "ai.use"],
    });
  });

  it("saves built-in role permission overrides and logs the change", async () => {
    const res = await saveRolePermissions({
      role: "lead",
      permissions: ["ai.use", "traffic.upload", "ai.use"],
    });

    expect(res).toEqual({ ok: true });
    const upsertArg = mock.systemSetting.upsert.mock.calls[0][0];
    expect(upsertArg.create).toEqual({
      key: "system_role_permissions",
      value: { lead: ["ai.use", "traffic.upload"] },
    });
    expect(mock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          action: "settings.permissions.update",
          entity: "role:lead",
        }),
      }),
    );
  });

  it("does not allow editing super permissions", async () => {
    expect(await saveRolePermissions({ role: "super", permissions: ["ai.use"] })).toEqual({
      ok: false,
      error: "immutable",
    });
  });
});
