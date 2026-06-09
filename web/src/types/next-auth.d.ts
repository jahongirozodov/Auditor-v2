import type { DefaultSession } from "next-auth";
import type { RoleCode } from "@/lib/types/roles";

// Augment Auth.js types so the session carries the canonical role + user id.
declare module "next-auth" {
  interface User {
    role: RoleCode;
  }
  interface Session {
    user: { id: string; role: RoleCode } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: RoleCode;
  }
}
