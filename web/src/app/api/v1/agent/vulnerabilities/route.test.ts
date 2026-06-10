// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  auth: { ok: true, identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" } } as
    | { ok: true; identity: { userId: string; auditId: string; tokenId: string } }
    | { ok: false; status: number; error: string },
}));

vi.mock("@/lib/agent/auth", () => ({ requireAgent: vi.fn(async () => h.auth) }));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    finding: {
      findMany: vi.fn(async () => [
        { id: "F-1", title: "x", severity: "high", status: "new", cvss: 8, asset: "a", taskId: "T-1", evidence: 1 },
      ]),
    },
    auditTokenUsageLog: { create: vi.fn(async () => ({})) },
  };
  return { prisma };
});

import { GET } from "./route";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mock = prisma as any;

const get = () => GET(new Request("http://x/api/v1/agent/vulnerabilities"));

beforeEach(() => {
  vi.clearAllMocks();
  h.auth = { ok: true, identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" } };
});

describe("GET /agent/vulnerabilities", () => {
  it("lists findings scoped to the token's audit", async () => {
    const res = await get();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.vulnerabilities).toHaveLength(1);
    expect(mock.finding.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { auditId: "AUD-1" } }),
    );
  });

  it("propagates an auth failure", async () => {
    h.auth = { ok: false, status: 401, error: "missing_token" };
    expect((await get()).status).toBe(401);
  });
});
