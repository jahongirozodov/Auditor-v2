import "server-only";
import { hash, verify } from "@node-rs/argon2";

/**
 * Argon2id params per docs/08-security.md (m=65536, t=3, p=4).
 * @node-rs/argon2 defaults to Argon2id, so the algorithm is left implicit
 * (referencing the const enum directly trips `isolatedModules`).
 */
const OPTS = {
  memoryCost: 65536,
  timeCost: 3,
  parallelism: 4,
} as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPTS);
}

/** Verify a plaintext against an Argon2id digest; never throws. */
export async function verifyPassword(digest: string, plain: string): Promise<boolean> {
  try {
    return await verify(digest, plain);
  } catch {
    return false;
  }
}
