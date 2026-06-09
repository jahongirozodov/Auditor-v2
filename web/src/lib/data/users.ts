import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import type { User } from "@/lib/types/entities";
import type { RoleCode } from "@/lib/types/roles";

type Row = { id: string; name: string; role: string; title: string; avatar: string; dept: string };

function toUser(u: Row): User {
  return {
    id: u.id,
    name: u.name,
    role: u.role as RoleCode,
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
  return u ? toUser(u) : { id, name: id, role: "t1", title: "", avatar: "?", dept: "" };
});

/** Full id→User map (small) — passed to client components that resolve user ids. */
export const getUsersById = cache(async (): Promise<Record<string, User>> => {
  const users = await getUsers();
  return Object.fromEntries(users.map((u) => [u.id, u]));
});
