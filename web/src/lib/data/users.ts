import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

type Row = {
  id: string;
  name: string;
  role: string;
  customRoleCode?: string | null;
  title: string;
  avatar: string;
  dept: string;
};

function toUser(u: Row): User {
  return {
    id: u.id,
    name: u.name,
    role: u.role as RoleCode,
    customRoleCode: u.customRoleCode ?? null,
    title: u.title,
    avatar: u.avatar,
    dept: u.dept,
  };
}

export const getUsers = cache(
  async (): Promise<User[]> => (await prisma.user.findMany()).map(toUser),
);

export const getUserById = cache(async (id: string): Promise<User> => {
  const u = await prisma.user.findUnique({ where: { id } });
  return u
    ? toUser(u)
    : { id, name: id, role: "t1", customRoleCode: null, title: "", avatar: "?", dept: "" };
});

/** Full id→User map (small) — passed to client components that resolve user ids. */
export const getUsersById = cache(async (): Promise<Record<string, User>> => {
  const users = await getUsers();
  return Object.fromEntries(users.map((u) => [u.id, u]));
});

export const getAdminUsers = cache(async () => {
  const rows = await (prisma as import("@prisma/client").PrismaClient).user.findMany({
    orderBy: { name: "asc" },
    include: {
      loginAttempts: {
        where: { success: true },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      },
    },
  });
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role as import("../types/roles").RoleCode,
    customRoleCode: u.customRoleCode ?? null,
    title: u.title,
    avatar: u.avatar,
    dept: u.dept,
    email: u.email,
    disabled: u.disabled,
    lastLogin: u.loginAttempts[0]?.createdAt.toISOString() ?? null,
  })) satisfies import("../types/entities").AdminUserView[];
});
