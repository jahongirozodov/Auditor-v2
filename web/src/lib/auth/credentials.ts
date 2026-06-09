import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { verifyPassword } from "./password";
import { findUserByEmail } from "./users";
import { isLocked, recordFailure, recordSuccess } from "./lockout";

export const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

/**
 * Credentials provider — DB-backed email/password with Argon2id verify, failed-
 * attempt lockout, and an append-only auth audit log. SEAM: LDAP/AD bind + TOTP
 * (docs/08-security.md); request IP threading is a 1B follow-up (nullable for now).
 */
export const credentialsProvider = Credentials({
  credentials: { email: {}, password: {} },
  async authorize(raw) {
    const parsed = credentialsSchema.safeParse(raw);
    if (!parsed.success) return null;
    const { email, password } = parsed.data;

    const user = await findUserByEmail(email);
    if (!user || user.disabled) {
      await recordFailure(user?.id ?? null, email);
      return null;
    }
    if (isLocked(user.lockedUntil)) {
      await recordFailure(user.id, email);
      return null;
    }
    const ok = await verifyPassword(user.passwordHash, password);
    if (!ok) {
      await recordFailure(user.id, email);
      return null;
    }
    await recordSuccess(user.id, email);
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  },
});
