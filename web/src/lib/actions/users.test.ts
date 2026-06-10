// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

const h = vi.hoisted(() => ({
  canUserManage: true,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@node-rs/argon2", () => ({ hash: vi.fn(async () => "HASH") }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u1", role: "super", name: "" })),
}));
vi.mock("@/lib/rbac.server", () => ({
  requireAnyPermission: vi.fn(async () => h.canUserManage),
}));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    user: {
      create: vi.fn(async ({ data }: { data: unknown }) => data),
      update: vi.fn(async ({ data }: { data: unknown }) => data),
      findUnique: vi.fn(async () => ({ disabled: false })),
      delete: vi.fn(async () => ({})),
    },
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

import { createUser, updateUser } from "./users";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mock = prisma as any;

beforeEach(() => {
  vi.clearAllMocks();
  h.canUserManage = true;
});

describe("user role assignment", () => {
  it("creates users with optional customRoleCode and logs the mutation", async () => {
    const res = await createUser({
      name: "Scanner Operator",
      email: "scanner@gov.uz",
      role: "lead",
      customRoleCode: "scanner_operator",
      title: "Operator",
      dept: "Audit",
      password: "Secret123",
    });

    expect(res.ok).toBe(true);
    expect(mock.user.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          role: "lead",
          customRoleCode: "scanner_operator",
        }),
      }),
    );
    expect(mock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "user.create" }),
      }),
    );
  });

  it("updates users with optional customRoleCode and logs the mutation", async () => {
    const res = await updateUser("u9", {
      name: "Scanner Operator",
      email: "scanner@gov.uz",
      role: "lead",
      customRoleCode: "scanner_operator",
      title: "Operator",
      dept: "Audit",
    });

    expect(res).toEqual({ ok: true });
    expect(mock.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u9" },
        data: expect.objectContaining({ customRoleCode: "scanner_operator" }),
      }),
    );
    expect(mock.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ action: "user.update", entity: "u9" }),
      }),
    );
  });

  it("forbids user mutations without user permissions", async () => {
    h.canUserManage = false;

    await expect(
      updateUser("u9", {
        name: "Scanner Operator",
        email: "scanner@gov.uz",
        role: "lead",
        customRoleCode: null,
        title: "Operator",
        dept: "Audit",
      }),
    ).rejects.toThrow("Ruxsat yoʻq");
  });
});
