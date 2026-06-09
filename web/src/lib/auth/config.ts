import type { NextAuthConfig } from "next-auth";
import type { RoleCode } from "@/lib/types/roles";

/**
 * Argon2-free Auth.js config (providers are added in src/auth.ts so this module
 * stays import-safe everywhere). JWT session carries the user id + canonical role.
 * Session max 8h per docs/08-security.md.
 */
export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: 8 * 60 * 60 },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        const u = user as { id?: string; role: RoleCode };
        token.id = u.id ?? "";
        token.role = u.role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = (token.id as string | undefined) ?? "";
      session.user.role = token.role as RoleCode;
      return session;
    },
  },
} satisfies NextAuthConfig;
