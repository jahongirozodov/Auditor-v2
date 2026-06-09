import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import type { RoleCode } from "@/lib/types/roles";

/** Cached per-request session read. */
export const getSession = cache(() => auth());

export interface ActiveSession {
  userId: string;
  role: RoleCode;
  name: string;
}

/**
 * Secure gate for every (app) page/layout. Redirects to /login when there is no
 * session. This is the real authorization boundary — the proxy is optimistic only.
 */
export async function requireSession(): Promise<ActiveSession> {
  const session = await getSession();
  if (!session?.user) redirect("/login");
  return {
    userId: session.user.id,
    role: session.user.role,
    name: session.user.name ?? "",
  };
}
