import { z } from "zod";
import { verifyPassword } from "@/lib/auth/password";
import { findUserByEmail } from "@/lib/auth/users";
import { isLocked, recordFailure, recordSuccess } from "@/lib/auth/lockout";
import { signAgentJwt } from "@/lib/agent/jwt";
import { json, clientIp } from "@/lib/agent/util";

const Body = z.object({ email: z.email(), password: z.string().min(1) });

/**
 * Agent password login (anonymous). Reuses the web login path's Argon2id verify +
 * failed-attempt lockout + auth audit log, then mints a login-scoped agent JWT
 * (no audit bound yet — the agent must validate an audit token next).
 */
export async function POST(req: Request) {
  const parsed = Body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return json({ ok: false, error: "invalid" }, 400);
  const { email, password } = parsed.data;
  const ip = clientIp(req);

  const user = await findUserByEmail(email);
  if (!user || user.disabled) {
    await recordFailure(user?.id ?? null, email, ip);
    return json({ ok: false, error: "invalid_credentials" }, 401);
  }
  if (isLocked(user.lockedUntil)) {
    await recordFailure(user.id, email, ip);
    return json({ ok: false, error: "locked" }, 423);
  }
  if (!(await verifyPassword(user.passwordHash, password))) {
    await recordFailure(user.id, email, ip);
    return json({ ok: false, error: "invalid_credentials" }, 401);
  }

  await recordSuccess(user.id, email, ip);
  const token = await signAgentJwt({ sub: user.id });
  return json({
    ok: true,
    token,
    user: { id: user.id, name: user.name, role: user.role },
  });
}
