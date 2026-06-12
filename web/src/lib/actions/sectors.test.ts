// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";

const h = vi.hoisted(() => ({
  canManage: true,
  createFails: false,
  deleteFails: false,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u2", role: "head", name: "" })),
}));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => h.canManage) }));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    sector: {
      create: vi.fn(async () => {
        if (h.createFails) throw new Error("unique constraint");
        return { id: "sec_1", name: "Davlat" };
      }),
      delete: vi.fn(async () => {
        if (h.deleteFails) throw new Error("not_found");
        return {};
      }),
    },
  };
  return { prisma };
});

import { createSector, deleteSector } from "./sectors";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

beforeEach(() => {
  vi.clearAllMocks();
  h.canManage = true;
  h.createFails = false;
  h.deleteFails = false;
});

describe("sector actions", () => {
  it("creates a sector and revalidates /organizations", async () => {
    const res = await createSector({ name: "Davlat" });
    expect(res).toEqual({ ok: true, id: "sec_1" });
    expect(mockPrisma.sector.create).toHaveBeenCalledWith({ data: { name: "Davlat" } });
    expect(revalidatePath).toHaveBeenCalledWith("/organizations");
  });

  it("rejects a name shorter than 2 chars", async () => {
    await expect(createSector({ name: "A" })).resolves.toEqual({
      ok: false,
      error: "invalid",
    });
  });

  it("returns duplicate error on unique constraint violation", async () => {
    h.createFails = true;
    await expect(createSector({ name: "Davlat" })).resolves.toEqual({
      ok: false,
      error: "duplicate",
    });
  });

  it("forbids a role without org.create permission", async () => {
    h.canManage = false;
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "t1", name: "" });
    await expect(createSector({ name: "Davlat" })).resolves.toEqual({
      ok: false,
      error: "forbidden",
    });
  });

  it("deletes a sector and revalidates /organizations", async () => {
    const res = await deleteSector("sec_1");
    expect(res).toEqual({ ok: true });
    expect(mockPrisma.sector.delete).toHaveBeenCalledWith({ where: { id: "sec_1" } });
    expect(revalidatePath).toHaveBeenCalledWith("/organizations");
  });

  it("returns not_found when delete target does not exist", async () => {
    h.deleteFails = true;
    await expect(deleteSector("missing")).resolves.toEqual({
      ok: false,
      error: "not_found",
    });
  });
});
