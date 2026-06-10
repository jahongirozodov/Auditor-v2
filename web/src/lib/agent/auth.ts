import "server-only";
import { prisma } from "@/lib/prisma";
import { verifyAgentJwt } from "./jwt";

export interface AgentIdentity {
  userId: string;
  auditId: string;
  tokenId: string;
}

export type AgentAuth =
  | { ok: true; identity: AgentIdentity }
  | { ok: false; status: 401 | 403; error: string };

const bearer = (req: Request): string | null => {
  const h = req.headers.get("authorization") ?? "";
  const m = /^Bearer\s+(.+)$/i.exec(h.trim());
  return m ? m[1] : null;
};

/**
 * Authenticate an agent request from its `Authorization: Bearer <jwt>` header.
 * Beyond signature/expiry, this re-checks the backing AuditToken on every call so
 * a revoked or expired token blocks the agent immediately (TZ §16.3) — the JWT
 * alone is not the authority. Returns the audit-scoped identity or an error.
 */
export async function requireAgent(req: Request): Promise<AgentAuth> {
  const raw = bearer(req);
  if (!raw) return { ok: false, status: 401, error: "missing_token" };

  const claims = await verifyAgentJwt(raw);
  if (!claims) return { ok: false, status: 401, error: "invalid_token" };
  if (!claims.auditId || !claims.tokenId) {
    // A login-only token (no audit bound) cannot reach scoped endpoints.
    return { ok: false, status: 403, error: "audit_scope_required" };
  }

  const token = await prisma.auditToken.findUnique({
    where: { id: claims.tokenId },
    select: { status: true, auditId: true, userId: true },
  });
  if (!token) return { ok: false, status: 401, error: "token_not_found" };
  if (token.status !== "active") return { ok: false, status: 403, error: "token_inactive" };
  // Defend against a JWT whose claims drifted from the DB row.
  if (token.auditId !== claims.auditId || token.userId !== claims.sub) {
    return { ok: false, status: 403, error: "token_mismatch" };
  }

  return {
    ok: true,
    identity: { userId: claims.sub, auditId: claims.auditId, tokenId: claims.tokenId },
  };
}
