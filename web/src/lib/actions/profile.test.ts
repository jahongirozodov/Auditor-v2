// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  user: { passwordHash: "DIGEST" } as { passwordHash: string } | null,
  verifyOk: true,
  cookieSet: vi.fn(),
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn(async () => ({ set: h.cookieSet })) }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u1", role: "lead", name: "" })),
}));
vi.mock("@/lib/auth/password", () => ({
  hashPassword: vi.fn(async () => "NEW_DIGEST"),
  verifyPassword: vi.fn(async () => h.verifyOk),
}));
vi.mock("@/i18n/config", () => ({ isLocale: (l: string) => ["uz", "ru", "en"].includes(l) }));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    user: {
      findUnique: vi.fn(async () => h.user),
      update: vi.fn(async () => ({})),
    },
    auditLog: { create: vi.fn(async () => ({})) },
    $transaction: vi.fn(),
  };
  prisma.$transaction.mockImplementation(async (arg: unknown) =>
    typeof arg === "function" ? (arg as (tx: typeof prisma) => unknown)(prisma) : undefined,
  );
  return { prisma };
});

import { prisma } from "@/lib/prisma";
import { updateOwnProfile, changeOwnPassword, setLocale } from "./profile";

beforeEach(() => {
  vi.clearAllMocks();
  h.user = { passwordHash: "DIGEST" };
  h.verifyOk = true;
});

describe("updateOwnProfile", () => {
  it("updates the own record + writes an audit log", async () => {
    const res = await updateOwnProfile({ name: "Yangi Ism", phone: "+998 90 000-00-00" });
    expect(res).toEqual({ ok: true });
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "u1" },
        data: expect.objectContaining({ name: "Yangi Ism", phone: "+998 90 000-00-00" }),
      }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it("rejects a too-short name", async () => {
    const res = await updateOwnProfile({ name: "A" });
    expect(res).toEqual({ ok: false, error: "invalid" });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("nulls empty phones", async () => {
    await updateOwnProfile({ name: "Ism Familiya", phone: "", workPhone: "" });
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ phone: null, workPhone: null }) }),
    );
  });
});

describe("changeOwnPassword", () => {
  it("changes the password on a valid current + matching confirm", async () => {
    const res = await changeOwnPassword({
      current: "old",
      next: "longenough1",
      confirm: "longenough1",
    });
    expect(res).toEqual({ ok: true });
    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { passwordHash: "NEW_DIGEST" } }),
    );
    expect(prisma.auditLog.create).toHaveBeenCalled();
  });

  it("rejects a weak new password", async () => {
    const res = await changeOwnPassword({ current: "old", next: "short", confirm: "short" });
    expect(res).toEqual({ ok: false, error: "weak" });
  });

  it("rejects a confirm mismatch", async () => {
    const res = await changeOwnPassword({
      current: "old",
      next: "longenough1",
      confirm: "different1",
    });
    expect(res).toEqual({ ok: false, error: "mismatch" });
  });

  it("rejects a wrong current password", async () => {
    h.verifyOk = false;
    const res = await changeOwnPassword({
      current: "wrong",
      next: "longenough1",
      confirm: "longenough1",
    });
    expect(res).toEqual({ ok: false, error: "wrong_current" });
    expect(prisma.user.update).not.toHaveBeenCalled();
  });
});

describe("setLocale", () => {
  it("sets the NEXT_LOCALE cookie for a valid locale", async () => {
    const res = await setLocale("ru");
    expect(res).toEqual({ ok: true });
    expect(h.cookieSet).toHaveBeenCalledWith(
      "NEXT_LOCALE",
      "ru",
      expect.objectContaining({ path: "/" }),
    );
  });

  it("rejects an unknown locale", async () => {
    const res = await setLocale("zz");
    expect(res).toEqual({ ok: false, error: "invalid" });
    expect(h.cookieSet).not.toHaveBeenCalled();
  });
});
