import "server-only";
import { prisma } from "@/lib/prisma";
import type { RoleCode } from "@/lib/types/roles";
import { DEMO_EMAIL, DEMO_HASH, EMAILS } from "./demo";

// Re-export demo constants (seed + tests import them from here too).
export { DEMO_EMAIL, DEMO_HASH, EMAILS };

/**
 * DB-backed auth user lookup.
 * SEAM (later): add LDAP/AD bind + TOTP (docs/08-security.md). Columns reserved
 * on the User model (totpSecret, etc.).
 */
export interface AuthUser {
  id: string;
  name: string;
  role: RoleCode;
  email: string;
  passwordHash: string;
  failedLogins: number;
  lockedUntil: Date | null;
  disabled: boolean;
}

export async function findUserByEmail(email: string): Promise<AuthUser | null> {
  const normalized = email.trim().toLowerCase();
  const u = await prisma.user.findUnique({ where: { email: normalized } });
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    role: u.role as RoleCode,
    email: u.email,
    passwordHash: u.passwordHash,
    failedLogins: u.failedLogins,
    lockedUntil: u.lockedUntil,
    disabled: u.disabled,
  };
}
