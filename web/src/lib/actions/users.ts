"use server";

import { revalidatePath } from "next/cache";
import { hash } from "@node-rs/argon2";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { canManage } from "@/lib/rbac";
import type { RoleCode } from "@/lib/types/roles";

function guard(role: string) {
  if (!canManage(role as RoleCode, "users"))
    throw new Error("Ruxsat yoʻq");
}

export interface UserInput {
  name: string;
  email: string;
  role: RoleCode;
  title: string;
  dept: string;
  password?: string;
}

export async function createUser(input: UserInput) {
  const { role } = await requireSession();
  guard(role);
  if (!input.password) return { ok: false, error: "Parol kiritilishi shart" };
  const passwordHash = await hash(input.password);
  const avatar = input.name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase();
  const id = `u${Date.now()}`;
  await prisma.user.create({
    data: { id, name: input.name, email: input.email, role: input.role as never, title: input.title, dept: input.dept, avatar, passwordHash },
  });
  revalidatePath("/users");
  return { ok: true, id };
}

export async function updateUser(id: string, input: Omit<UserInput, "password">) {
  const { role } = await requireSession();
  guard(role);
  await prisma.user.update({
    where: { id },
    data: { name: input.name, email: input.email, role: input.role as never, title: input.title, dept: input.dept },
  });
  revalidatePath("/users");
  return { ok: true };
}

export async function toggleUserLock(id: string) {
  const { role } = await requireSession();
  guard(role);
  const u = await prisma.user.findUnique({ where: { id }, select: { disabled: true } });
  if (!u) return { ok: false };
  await prisma.user.update({ where: { id }, data: { disabled: !u.disabled } });
  revalidatePath("/users");
  return { ok: true, disabled: !u.disabled };
}

export async function deleteUser(id: string) {
  const { role, userId } = await requireSession();
  guard(role);
  if (id === userId) return { ok: false, error: "Oʻz hisobingizni oʻchira olmaysiz" };
  await prisma.user.delete({ where: { id } });
  revalidatePath("/users");
  return { ok: true };
}
