import "server-only";
import { NextResponse } from "next/server";

/** JSON response helper for agent route handlers. */
export const json = <T>(data: T, status = 200) => NextResponse.json(data, { status });

/** Best-effort client IP from forwarding headers (closed network → single hop). */
export const clientIp = (req: Request): string | undefined =>
  req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
  req.headers.get("x-real-ip")?.trim() ||
  undefined;

/**
 * Token expiry test. AuditToken.expires is a "YYYY-MM-DD HH:mm" string (the seed/
 * issue stamp format). A blank/"—" value is treated as non-expiring.
 */
export function isTokenExpired(expires: string, now: Date = new Date()): boolean {
  if (!expires || expires === "—") return false;
  const t = Date.parse(expires.replace(" ", "T"));
  if (Number.isNaN(t)) return false;
  return t < now.getTime();
}
