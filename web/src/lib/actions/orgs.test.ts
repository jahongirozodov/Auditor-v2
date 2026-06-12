// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";

const h = vi.hoisted(() => ({
  canManage: true,
  updateFails: false,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u2", role: "head", name: "" })),
}));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => h.canManage) }));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    organization: {
      create: vi.fn(async () => ({})),
      update: vi.fn(async () => {
        if (h.updateFails) throw new Error("not_found");
        return {};
      }),
    },
    auditLog: { create: vi.fn(async () => ({})) },
    $transaction: vi.fn(async (arg: unknown) => Promise.all(arg as unknown[])),
  };
  return { prisma };
});

import { createOrganization, updateOrganization } from "./orgs";
import { prisma } from "@/lib/prisma";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

const validInput = {
  name: "Yangi tashkilot",
  stir: "123456789",
  sector: "Davlat",
  contact: "info@gov.uz",
  head: "Ali Valiyev",
};

beforeEach(() => {
  vi.clearAllMocks();
  h.canManage = true;
  h.updateFails = false;
  vi.stubGlobal("crypto", { randomUUID: () => "fixed-id" });
});

describe("organization actions", () => {
  it("creates an organization and revalidates the list", async () => {
    const res = await createOrganization(validInput);
    expect(res).toEqual({ ok: true, id: "org_fixed-id" });
    expect(mockPrisma.organization.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ id: "org_fixed-id", name: "Yangi tashkilot", audits: 0 }),
    });
    expect(revalidatePath).toHaveBeenCalledWith("/organizations");
  });

  it("rejects invalid STIR", async () => {
    await expect(createOrganization({ ...validInput, stir: "123" })).resolves.toEqual({
      ok: false,
      error: "invalid",
    });
  });

  it("forbids a role without full organization access", async () => {
    h.canManage = false;
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "t1", name: "" });
    await expect(createOrganization(validInput)).resolves.toEqual({
      ok: false,
      error: "forbidden",
    });
  });

  it("updates an organization and revalidates list and detail", async () => {
    const res = await updateOrganization("o1", validInput);
    expect(res).toEqual({ ok: true });
    expect(mockPrisma.organization.update).toHaveBeenCalledWith({
      where: { id: "o1" },
      data: validInput,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/organizations");
    expect(revalidatePath).toHaveBeenCalledWith("/organizations/o1");
  });

  it("returns not_found when update misses", async () => {
    h.updateFails = true;
    await expect(updateOrganization("missing", validInput)).resolves.toEqual({
      ok: false,
      error: "not_found",
    });
  });
});
