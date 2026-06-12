"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import type { ActionResult, CreateResult } from "./types";

const SectorInput = z.object({
  name: z.string().trim().min(2).max(80),
});

export async function createSector(input: { name: string }): Promise<CreateResult> {
  const parsed = SectorInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "org.create"))) return { ok: false, error: "forbidden" };

  try {
    const sector = await prisma.sector.create({ data: { name: parsed.data.name } });
    revalidatePath("/organizations");
    return { ok: true, id: sector.id };
  } catch {
    return { ok: false, error: "duplicate" };
  }
}

export async function deleteSector(id: string): Promise<ActionResult> {
  if (!id) return { ok: false, error: "invalid" };

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "org.create"))) return { ok: false, error: "forbidden" };

  try {
    await prisma.sector.delete({ where: { id } });
    revalidatePath("/organizations");
    return { ok: true };
  } catch {
    return { ok: false, error: "not_found" };
  }
}
