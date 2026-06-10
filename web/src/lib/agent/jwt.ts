import "server-only";
import { SignJWT, jwtVerify } from "jose";

/**
 * Agent session tokens — HS256, signed with AGENT_JWT_SECRET. Separate from the
 * Auth.js web session: the desktop agent (TZ §16) authenticates over a stateless
 * bearer token, not a cookie. A token is minted on password login (no audit yet)
 * and re-minted, scoped to an audit, after audit-token validation.
 */
export interface AgentClaims {
  /** User id (the auditor). */
  sub: string;
  /** Audit the agent is scoped to; absent right after password login. */
  auditId?: string;
  /** AuditToken id backing this session; absent right after password login. */
  tokenId?: string;
}

const secret = () => {
  const s = process.env.AGENT_JWT_SECRET;
  if (!s) throw new Error("AGENT_JWT_SECRET is not set");
  return new TextEncoder().encode(s);
};

const ttlHours = () => Number(process.env.AGENT_JWT_TTL_HOURS ?? 12);

export async function signAgentJwt(claims: AgentClaims): Promise<string> {
  return new SignJWT({ auditId: claims.auditId, tokenId: claims.tokenId })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(`${ttlHours()}h`)
    .sign(secret());
}

/** Verify + decode an agent JWT. Returns null on any failure (expired/tampered/wrong alg). */
export async function verifyAgentJwt(token: string): Promise<AgentClaims | null> {
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    if (!payload.sub) return null;
    return {
      sub: payload.sub,
      auditId: typeof payload.auditId === "string" ? payload.auditId : undefined,
      tokenId: typeof payload.tokenId === "string" ? payload.tokenId : undefined,
    };
  } catch {
    return null;
  }
}
