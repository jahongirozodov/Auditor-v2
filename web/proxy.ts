import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Next 16 Proxy (formerly middleware). OPTIMISTIC auth guard only — it checks for
// the presence of the Auth.js session cookie and redirects. The real authorization
// boundary is requireSession() in (app)/layout.tsx (docs/08-security.md).

const SESSION_COOKIES = ["authjs.session-token", "__Secure-authjs.session-token"];

function hasSession(req: NextRequest): boolean {
  return SESSION_COOKIES.some((c) => req.cookies.has(c));
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = hasSession(req);
  const onLogin = pathname === "/login";

  if (!authed && !onLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  if (authed && onLogin) {
    const url = req.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  // Run on everything except API routes, Next internals, and static assets.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|svg|webp|woff2|ico)$).*)"],
};
