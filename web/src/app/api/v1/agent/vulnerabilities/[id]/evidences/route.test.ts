// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  auth: { ok: true, identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" } } as
    | { ok: true; identity: { userId: string; auditId: string; tokenId: string } }
    | { ok: false; status: number; error: string },
  finding: { id: "F-1" } as { id: string } | null,
}));

vi.mock("@/lib/agent/auth", () => ({ requireAgent: vi.fn(async () => h.auth) }));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    finding: { findFirst: vi.fn(async () => h.finding) },
    findingEvidence: {
      findMany: vi.fn(async () => [
        {
          id: "ev1",
          kind: "screenshot",
          createdAt: new Date("2026-06-10T00:00:00Z"),
          file: { filename: "s.png", mimeType: "image/png", sizeBytes: 10, sha256: "ab" },
        },
      ]),
    },
  };
  return { prisma };
});

import { GET } from "./route";

const get = (id = "F-1") =>
  GET(new Request(`http://x/api/v1/agent/vulnerabilities/${id}/evidences`), {
    params: Promise.resolve({ id }),
  });

beforeEach(() => {
  vi.clearAllMocks();
  h.auth = { ok: true, identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" } };
  h.finding = { id: "F-1" };
});

describe("GET /agent/vulnerabilities/[id]/evidences", () => {
  it("returns the finding's evidence file metadata", async () => {
    const res = await get();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.evidences[0]).toMatchObject({
      filename: "s.png",
      kind: "screenshot",
      sizeBytes: 10,
    });
  });

  it("404s when the finding isn't in the token's audit", async () => {
    h.finding = null;
    expect((await get("F-9")).status).toBe(404);
  });
});
