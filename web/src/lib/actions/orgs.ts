"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requirePermission } from "@/lib/rbac.server";
import type { ActionResult, CreateResult } from "./types";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));

const OrganizationInput = z.object({
  name: z.string().trim().min(3).max(160),
  stir: z
    .string()
    .trim()
    .regex(/^\d{9}$/),
  sector: z.string().trim().min(2).max(80),
  contact: z.string().trim().min(2).max(120),
  head: z.string().trim().min(2).max(120),
});

export type OrganizationInput = z.input<typeof OrganizationInput>;

export async function createOrganization(input: OrganizationInput): Promise<CreateResult> {
  const parsed = OrganizationInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "org.create"))) return { ok: false, error: "forbidden" };

  const id = `org_${crypto.randomUUID()}`;
  await prisma.$transaction([
    prisma.organization.create({
      data: {
        id,
        ...parsed.data,
        audits: 0,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: "org.create",
        entity: id,
        level: "info",
        payload: J({ name: parsed.data.name, stir: parsed.data.stir }),
      },
    }),
  ]);

  revalidatePath("/organizations");
  return { ok: true, id };
}

export async function updateOrganization(
  id: string,
  input: OrganizationInput,
): Promise<ActionResult> {
  if (!id) return { ok: false, error: "invalid" };
  const parsed = OrganizationInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const { userId } = await requireSession();
  if (!(await requirePermission(userId, "org.update"))) return { ok: false, error: "forbidden" };

  try {
    await prisma.$transaction([
      prisma.organization.update({
        where: { id },
        data: parsed.data,
      }),
      prisma.auditLog.create({
        data: {
          userId,
          action: "org.update",
          entity: id,
          level: "info",
          payload: J({ name: parsed.data.name, stir: parsed.data.stir }),
        },
      }),
    ]);
  } catch {
    return { ok: false, error: "not_found" };
  }

  revalidatePath("/organizations");
  revalidatePath(`/organizations/${id}`);
  return { ok: true };
}
