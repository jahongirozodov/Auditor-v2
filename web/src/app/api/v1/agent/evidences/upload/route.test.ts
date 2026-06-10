// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  auth: { ok: true, identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" } } as
    | { ok: true; identity: { userId: string; auditId: string; tokenId: string } }
    | { ok: false; status: number; error: string },
  finding: { id: "F-2026-0001" } as { id: string } | null,
}));

vi.mock("@/lib/agent/auth", () => ({ requireAgent: vi.fn(async () => h.auth) }));
vi.mock("@/lib/prisma", () => {
  const tx = {
    fileStorage: { create: vi.fn(async () => ({ id: "file1" })) },
    findingEvidence: { create: vi.fn(async () => ({ id: "ev1" })) },
    finding: { update: vi.fn(async () => ({})) },
    auditTokenUsageLog: { create: vi.fn(async () => ({})) },
  };
  const prisma = {
    finding: { findFirst: vi.fn(async () => h.finding) },
    $transaction: vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
    _tx: tx,
  };
  return { prisma };
});

import { POST } from "./route";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mock = prisma as any;

function post(opts: { withFile?: boolean; findingKey?: string } = {}) {
  const fd = new FormData();
  if (opts.withFile ?? true)
    fd.append("file", new File([new Uint8Array([1, 2, 3, 4])], "shot.png", { type: "image/png" }));
  fd.append("findingKey", opts.findingKey ?? "key-0001");
  return POST(new Request("http://x/api/v1/agent/evidences/upload", { method: "POST", body: fd }));
}

beforeEach(() => {
  vi.clearAllMocks();
  h.auth = { ok: true, identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" } };
  h.finding = { id: "F-2026-0001" };
});

describe("POST /agent/evidences/upload", () => {
  it("stores bytes + links a FindingEvidence and bumps the count", async () => {
    const res = await post();
    expect(await res.json()).toMatchObject({ ok: true, id: "ev1" });
    expect(mock._tx.fileStorage.create).toHaveBeenCalledOnce();
    expect(mock._tx.findingEvidence.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ findingId: "F-2026-0001", kind: "screenshot" }) }),
    );
    expect(mock._tx.finding.update).toHaveBeenCalledWith({
      where: { id: "F-2026-0001" },
      data: { evidence: { increment: 1 } },
    });
  });

  it("404s when the finding isn't synced yet", async () => {
    h.finding = null;
    const res = await post();
    expect(res.status).toBe(404);
    expect(await res.json()).toMatchObject({ error: "finding_not_found" });
  });

  it("400s without a file", async () => {
    const res = await post({ withFile: false });
    expect(res.status).toBe(400);
  });

  it("propagates an auth failure", async () => {
    h.auth = { ok: false, status: 401, error: "missing_token" };
    expect((await post()).status).toBe(401);
  });
});
