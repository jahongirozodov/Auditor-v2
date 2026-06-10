// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const h = vi.hoisted(() => ({
  auth: { ok: true, identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" } } as
    | { ok: true; identity: { userId: string; auditId: string; tokenId: string } }
    | { ok: false; status: number; error: string },
  task: { auditId: "AUD-1", status: "in_progress", assigneeId: "u6" } as
    | { auditId: string; status: string; assigneeId: string }
    | null,
}));

vi.mock("@/lib/agent/auth", () => ({ requireAgent: vi.fn(async () => h.auth) }));
vi.mock("@/lib/prisma", () => {
  const tx = {
    task: { update: vi.fn(async () => ({})), findMany: vi.fn(async () => []) },
    taskStatusHistory: { create: vi.fn(async () => ({})) },
    auditTokenUsageLog: { create: vi.fn(async () => ({})) },
    auditLog: { create: vi.fn(async () => ({})) },
    audit: { update: vi.fn(async () => ({})) },
  };
  const prisma = {
    task: { findUnique: vi.fn(async () => h.task) },
    $transaction: vi.fn(async (fn: (t: typeof tx) => unknown) => fn(tx)),
    _tx: tx,
  };
  return { prisma };
});

import { POST } from "./route";
import { prisma } from "@/lib/prisma";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mock = prisma as any;

const post = (taskId: string, toStatus: string) =>
  POST(
    new Request(`http://x/api/v1/agent/tasks/${taskId}/status`, {
      method: "POST",
      body: JSON.stringify({ toStatus }),
    }),
    { params: Promise.resolve({ taskId }) },
  );

beforeEach(() => {
  vi.clearAllMocks();
  h.auth = { ok: true, identity: { userId: "u6", auditId: "AUD-1", tokenId: "tk_x" } };
  h.task = { auditId: "AUD-1", status: "in_progress", assigneeId: "u6" };
});

describe("POST /agent/tasks/[id]/status", () => {
  it("completes an in_progress task (assignee → done)", async () => {
    const res = await post("T-1", "done");
    expect(await res.json()).toMatchObject({ ok: true, status: "done" });
    expect(mock._tx.task.update).toHaveBeenCalledWith({ where: { id: "T-1" }, data: { status: "done" } });
  });

  it("rejects an illegal transition (done → in_progress)", async () => {
    h.task = { auditId: "AUD-1", status: "done", assigneeId: "u6" };
    const res = await post("T-1", "in_progress");
    expect(res.status).toBe(409);
    expect(await res.json()).toMatchObject({ error: "illegal_transition" });
  });

  it("forbids a non-assignee", async () => {
    h.task = { auditId: "AUD-1", status: "in_progress", assigneeId: "someone-else" };
    const res = await post("T-1", "done");
    expect(res.status).toBe(403);
  });

  it("blocks a task outside the token's audit", async () => {
    h.task = { auditId: "AUD-OTHER", status: "in_progress", assigneeId: "u6" };
    const res = await post("T-1", "done");
    expect(res.status).toBe(403);
    expect(await res.json()).toMatchObject({ error: "task_scope" });
  });

  it("is a no-op when already at the target status", async () => {
    h.task = { auditId: "AUD-1", status: "done", assigneeId: "u6" };
    const res = await post("T-1", "done");
    expect(await res.json()).toMatchObject({ ok: true });
    expect(mock._tx.task.update).not.toHaveBeenCalled();
  });

  it("404s an unknown task", async () => {
    h.task = null;
    expect((await post("T-9", "done")).status).toBe(404);
  });
});
