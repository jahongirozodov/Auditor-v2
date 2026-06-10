"use server";

import { revalidatePath } from "next/cache";
import { hash } from "@node-rs/argon2";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { requireAnyPermission } from "@/lib/rbac.server";
import type { RoleCode } from "@/lib/types/roles";

async function guard(userId: string) {
  if (!(await requireAnyPermission(userId, ["user.create", "user.update", "user.disable"])))
    throw new Error("Ruxsat yoʻq");
}

export interface UserInput {
  name: string;
  email: string;
  role: RoleCode;
  customRoleCode?: string | null;
  title: string;
  dept: string;
  password?: string;
}

export async function createUser(input: UserInput) {
  const { userId } = await requireSession();
  await guard(userId);
  if (!input.password) return { ok: false, error: "Parol kiritilishi shart" };
  const passwordHash = await hash(input.password);
  const avatar = input.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
  const id = `u${Date.now()}`;
  await prisma.$transaction([
    prisma.user.create({
      data: {
        id,
        name: input.name,
        email: input.email,
        role: input.role as never,
        customRoleCode: input.customRoleCode || null,
        title: input.title,
        dept: input.dept,
        avatar,
        passwordHash,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: "user.create",
        entity: id,
        level: "info",
        payload: {
          email: input.email,
          role: input.role,
          customRoleCode: input.customRoleCode || null,
        },
      },
    }),
  ]);
  revalidatePath("/users");
  return { ok: true, id };
}

export async function updateUser(id: string, input: Omit<UserInput, "password">) {
  const { userId } = await requireSession();
  await guard(userId);
  await prisma.$transaction([
    prisma.user.update({
      where: { id },
      data: {
        name: input.name,
        email: input.email,
        role: input.role as never,
        customRoleCode: input.customRoleCode || null,
        title: input.title,
        dept: input.dept,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId,
        action: "user.update",
        entity: id,
        level: "info",
        payload: {
          email: input.email,
          role: input.role,
          customRoleCode: input.customRoleCode || null,
        },
      },
    }),
  ]);
  revalidatePath("/users");
  return { ok: true };
}

export async function toggleUserLock(id: string) {
  const { userId } = await requireSession();
  await guard(userId);
  const u = await prisma.user.findUnique({ where: { id }, select: { disabled: true } });
  if (!u) return { ok: false };
  await prisma.$transaction([
    prisma.user.update({ where: { id }, data: { disabled: !u.disabled } }),
    prisma.auditLog.create({
      data: {
        userId,
        action: !u.disabled ? "user.disable" : "user.enable",
        entity: id,
        level: !u.disabled ? "warn" : "info",
      },
    }),
  ]);
  revalidatePath("/users");
  return { ok: true, disabled: !u.disabled };
}

export async function deleteUser(id: string) {
  const { userId } = await requireSession();
  await guard(userId);
  if (id === userId) return { ok: false, error: "Oʻz hisobingizni oʻchira olmaysiz" };
  await prisma.$transaction([
    prisma.user.delete({ where: { id } }),
    prisma.auditLog.create({
      data: { userId, action: "user.delete", entity: id, level: "warn" },
    }),
  ]);
  revalidatePath("/users");
  return { ok: true };
}
