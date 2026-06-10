"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { isLocale } from "@/i18n/config";
import type { ActionResult } from "./types";

const J = (v: unknown) => JSON.parse(JSON.stringify(v));

const ProfileInput = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional().default(""),
  workPhone: z.string().trim().max(40).optional().default(""),
});

/**
 * Self-service profile edit. A user updates only their OWN record (ownership is
 * guaranteed by `requireSession`, so no module RBAC gate). Title/role/dept stay
 * admin-only (the Users screen). Appends an audit-log entry.
 */
export async function updateOwnProfile(input: z.input<typeof ProfileInput>): Promise<ActionResult> {
  const parsed = ProfileInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { name, phone, workPhone } = parsed.data;

  const { userId } = await requireSession();
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: userId },
      data: { name, phone: phone || null, workPhone: workPhone || null },
    });
    await tx.auditLog.create({
      data: {
        userId,
        action: "profile.update",
        entity: userId,
        level: "info",
        payload: J({ name, phone, workPhone }),
      },
    });
  });

  revalidatePath("/profile");
  return { ok: true };
}

const PasswordInput = z.object({
  current: z.string().min(1),
  next: z.string().min(1),
  confirm: z.string().min(1),
});

/**
 * Change own password: verify the current one against the Argon2id digest, enforce
 * a minimum length + confirmation match, then store the new hash. Logged as an
 * append-only security event. Reuses auth/password.ts (same params as login).
 */
export async function changeOwnPassword(
  input: z.input<typeof PasswordInput>,
): Promise<ActionResult> {
  const parsed = PasswordInput.safeParse(input);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { current, next, confirm } = parsed.data;

  if (next.length < 8) return { ok: false, error: "weak" };
  if (next !== confirm) return { ok: false, error: "mismatch" };

  const { userId } = await requireSession();
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user) return { ok: false, error: "not_found" };

  const valid = await verifyPassword(user.passwordHash, current);
  if (!valid) return { ok: false, error: "wrong_current" };

  const passwordHash = await hashPassword(next);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: userId }, data: { passwordHash } });
    await tx.auditLog.create({
      data: { userId, action: "profile.password_change", entity: userId, level: "info" },
    });
  });

  return { ok: true };
}

/** Switch the UI language by setting the NEXT_LOCALE cookie (read by i18n/request.ts). */
export async function setLocale(locale: string): Promise<ActionResult> {
  if (!isLocale(locale)) return { ok: false, error: "invalid" };
  await requireSession();
  const store = await cookies();
  store.set("NEXT_LOCALE", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/profile");
  return { ok: true };
}
