// @vitest-environment node
import { describe, it, expect, vi } from "vitest";

// DB-backed users — mock Prisma so the auth layer is unit-testable without a DB.
vi.mock("@/lib/prisma", () => {
  const DEMO_HASH =
    "$argon2id$v=19$m=65536,t=3,p=4$yh7c7wvz6iesD3T3D3hbJQ$WbP2WQocd4VL2iOGiooev1G7AB/Yv5x7XHdllV3vePU";
  return {
    prisma: {
      user: {
        findUnique: async ({ where }: { where: { email?: string } }) =>
          where.email === "a.yoldoshev@gov.uz"
            ? {
                id: "u1",
                name: "Akmal Yoʻldoshev",
                role: "super",
                email: "a.yoldoshev@gov.uz",
                passwordHash: DEMO_HASH,
                failedLogins: 0,
                lockedUntil: null,
                disabled: false,
              }
            : null,
      },
    },
  };
});

import { hashPassword, verifyPassword } from "./password";
import { findUserByEmail, DEMO_EMAIL } from "./users";
import { credentialsSchema } from "./credentials";

const DEMO_PASSWORD = "Auditor!2026";

describe("password (argon2id)", () => {
  it("round-trips a hash", async () => {
    const digest = await hashPassword("hunter2-correct-horse");
    expect(digest).toMatch(/^\$argon2id\$/);
    expect(await verifyPassword(digest, "hunter2-correct-horse")).toBe(true);
    expect(await verifyPassword(digest, "wrong")).toBe(false);
  });

  it("never throws on a malformed digest", async () => {
    expect(await verifyPassword("not-a-hash", "x")).toBe(false);
  });

  it("verifies the seeded demo password against the stored digest", async () => {
    const user = await findUserByEmail(DEMO_EMAIL);
    expect(user).not.toBeNull();
    expect(await verifyPassword(user!.passwordHash, DEMO_PASSWORD)).toBe(true);
    expect(await verifyPassword(user!.passwordHash, "nope")).toBe(false);
  });
});

describe("findUserByEmail", () => {
  it("resolves a known demo user with a canonical role", async () => {
    const user = await findUserByEmail("a.yoldoshev@gov.uz");
    expect(user?.id).toBe("u1");
    expect(user?.role).toBe("super");
  });

  it("is case-insensitive and trims", async () => {
    expect((await findUserByEmail("  A.Yoldoshev@GOV.uz "))?.id).toBe("u1");
  });

  it("returns null for unknown email", async () => {
    expect(await findUserByEmail("ghost@gov.uz")).toBeNull();
  });
});

describe("credentialsSchema", () => {
  it("accepts a valid email + password", () => {
    expect(credentialsSchema.safeParse({ email: DEMO_EMAIL, password: "x" }).success).toBe(true);
  });
  it("rejects a bad email or empty password", () => {
    expect(credentialsSchema.safeParse({ email: "nope", password: "x" }).success).toBe(false);
    expect(credentialsSchema.safeParse({ email: DEMO_EMAIL, password: "" }).success).toBe(false);
  });
});
