// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";
import { revalidatePath } from "next/cache";
import { requireSession } from "@/lib/session";

const h = vi.hoisted(() => ({
  task: { id: "T-1", status: "assigned", assigneeId: "u1", auditId: "AUD-1", due: "2099-12-31" },
  audit: { status: "in_progress", leaderId: "u1", members: [{ userId: "u6" }] } as {
    status: string;
    leaderId: string;
    members: { userId: string }[];
  },
  tasks: [] as { id: string; status: string }[],
  transactionError: null as Error | null,
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("@/lib/session", () => ({
  requireSession: vi.fn(async () => ({ userId: "u1", role: "lead", name: "" })),
}));
vi.mock("@/lib/rbac.server", () => ({ requirePermission: vi.fn(async () => true) }));
vi.mock("@/lib/prisma", () => {
  const prisma = {
    task: {
      findUnique: vi.fn(async () => ({ ...h.task, audit: { leaderId: h.audit.leaderId } })),
      update: vi.fn(async () => h.task),
      create: vi.fn(async () => ({})),
      findMany: vi.fn(async () => h.tasks),
    },
    taskStatusHistory: { create: vi.fn(async () => ({})) },
    auditLog: { create: vi.fn(async () => ({})) },
    audit: { findUnique: vi.fn(async () => h.audit), update: vi.fn(async () => ({})) },
    kpiEvent: { create: vi.fn(async () => ({})) },
    kpiUser: { upsert: vi.fn(async () => ({})) },
    $transaction: vi.fn(),
  };
  prisma.$transaction.mockImplementation(async (arg: unknown) =>
    h.transactionError
      ? Promise.reject(h.transactionError)
      : typeof arg === "function"
        ? (arg as (tx: typeof prisma) => unknown)(prisma)
        : Promise.all(arg as unknown[]),
  );
  return { prisma };
});

import { createTask, taskTransition } from "./tasks";
import { prisma } from "@/lib/prisma";
// kpiEvent is added by the schema migration; cast until `prisma db push` regenerates the client.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockPrisma = prisma as any;

beforeEach(() => {
  vi.clearAllMocks();
  h.task = { id: "T-1", status: "assigned", assigneeId: "u1", auditId: "AUD-1", due: "2099-12-31" };
  h.audit = { status: "in_progress", leaderId: "u1", members: [{ userId: "u6" }] };
  h.tasks = [{ id: "T-125", status: "in_progress" }];
  h.transactionError = null;
});

describe("taskTransition", () => {
  it("rejects an illegal transition", async () => {
    h.task.status = "assigned";
    const res = await taskTransition({ taskId: "T-1", action: "approve" });
    expect(res).toEqual({ ok: false, error: "illegal_transition" });
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("forbids a t1 non-assignee from approving", async () => {
    h.task.status = "review";
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "t1", name: "" });
    const res = await taskTransition({ taskId: "T-1", action: "approve" });
    expect(res).toEqual({ ok: false, error: "forbidden" });
  });

  it("forbids self-approval even when the assignee is the audit leader", async () => {
    h.task = { id: "T-1", status: "review", assigneeId: "u1", auditId: "AUD-1", due: "2099-12-31" };
    h.audit = { status: "in_progress", leaderId: "u1", members: [{ userId: "u1" }] };
    const res = await taskTransition({ taskId: "T-1", action: "approve" });
    expect(res).toEqual({ ok: false, error: "forbidden" });
    expect(mockPrisma.task.update).not.toHaveBeenCalled();
  });

  it("forbids a lead role user who is not the audit leader from approving", async () => {
    h.task = { id: "T-1", status: "review", assigneeId: "u6", auditId: "AUD-1", due: "2099-12-31" };
    h.audit = { status: "in_progress", leaderId: "u3", members: [{ userId: "u6" }] };
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u4", role: "lead", name: "" });
    const res = await taskTransition({ taskId: "T-1", action: "approve" });
    expect(res).toEqual({ ok: false, error: "forbidden" });
  });

  it("lets the audit leader approve another assignee's task", async () => {
    h.task = { id: "T-1", status: "review", assigneeId: "u6", auditId: "AUD-1", due: "2099-12-31" };
    h.audit = { status: "in_progress", leaderId: "u1", members: [{ userId: "u6" }] };
    const res = await taskTransition({ taskId: "T-1", action: "approve" });
    expect(res).toEqual({ ok: true });
  });

  it("requires a comment to return", async () => {
    h.task = { id: "T-1", status: "review", assigneeId: "u6", auditId: "AUD-1", due: "2099-12-31" };
    h.audit = { status: "in_progress", leaderId: "u1", members: [{ userId: "u6" }] };
    const res = await taskTransition({ taskId: "T-1", action: "return" });
    expect(res).toEqual({ ok: false, error: "comment_required" });
  });

  it("starts an assigned task and revalidates", async () => {
    h.task.status = "assigned";
    const res = await taskTransition({ taskId: "T-1", action: "start" });
    expect(res).toEqual({ ok: true });
    expect(revalidatePath).toHaveBeenCalledWith("/tasks/T-1");
  });
});

const validTask = {
  auditId: "AUD-1",
  title: "Firewall qoidalarini tahlil qilish",
  type: "Konfiguratsiya",
  priority: "Oʻrta",
  due: "2026-06-01",
  assigneeId: "u6",
};

describe("createTask", () => {
  it("lets the audit leader create the next code, assign, and revalidate", async () => {
    const res = await createTask(validTask);
    expect(res).toEqual({ ok: true, id: "T-126" });
    expect(revalidatePath).toHaveBeenCalledWith("/tasks/assign");
  });

  it("forbids a non-leader chief/lead/t1", async () => {
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u9", role: "chief", name: "" });
    expect(await createTask(validTask)).toEqual({ ok: false, error: "forbidden" });
  });

  it("allows head/super administrative override", async () => {
    h.audit = { status: "in_progress", leaderId: "u3", members: [{ userId: "u6" }] };
    vi.mocked(requireSession).mockResolvedValueOnce({ userId: "u2", role: "head", name: "" });
    expect(await createTask(validTask)).toEqual({ ok: true, id: "T-126" });
  });

  it("rejects an assignee who is not an audit member", async () => {
    expect(await createTask({ ...validTask, assigneeId: "u99" })).toEqual({
      ok: false,
      error: "not_member",
    });
  });

  it("rejects creation outside a work phase", async () => {
    h.audit = { status: "planning", leaderId: "u1", members: [{ userId: "u6" }] };
    expect(await createTask(validTask)).toEqual({ ok: false, error: "illegal_status" });
  });

  it("rejects an invalid (too short) title", async () => {
    expect(await createTask({ ...validTask, title: "x" })).toEqual({ ok: false, error: "invalid" });
  });

  it("does not misreport generic transaction failures as code conflicts", async () => {
    h.transactionError = new Error("kpi failed");
    expect(await createTask(validTask)).toEqual({ ok: false, error: "failed" });
  });

  it("emits assign_tasks_correctly KPI event on task creation", async () => {
    await createTask(validTask);
    const calls = mockPrisma.kpiEvent.create.mock.calls as [{ data: { ruleCode: string } }][];
    expect(calls.some((c) => c[0].data.ruleCode === "assign_tasks_correctly")).toBe(true);
  });
});

describe("taskTransition KPI emission", () => {
  it("emits task_completed and task_on_time when completed before due date", async () => {
    h.task = { id: "T-1", status: "review", assigneeId: "u6", auditId: "AUD-1", due: "2099-12-31" };
    h.audit = { status: "in_progress", leaderId: "u1", members: [{ userId: "u6" }] };
    await taskTransition({ taskId: "T-1", action: "approve" });
    const codes = mockPrisma.kpiEvent.create.mock.calls.map(
      (c: [{ data: { ruleCode: string } }]) => c[0].data.ruleCode,
    );
    expect(codes).toContain("task_completed");
    expect(codes).toContain("task_on_time");
    expect(codes).not.toContain("task_overdue");
  });

  it("emits task_overdue (not task_on_time) when completed past due date", async () => {
    h.task = { id: "T-1", status: "review", assigneeId: "u6", auditId: "AUD-1", due: "2020-01-01" };
    h.audit = { status: "in_progress", leaderId: "u1", members: [{ userId: "u6" }] };
    await taskTransition({ taskId: "T-1", action: "approve" });
    const codes = mockPrisma.kpiEvent.create.mock.calls.map(
      (c: [{ data: { ruleCode: string } }]) => c[0].data.ruleCode,
    );
    expect(codes).toContain("task_completed");
    expect(codes).toContain("task_overdue");
    expect(codes).not.toContain("task_on_time");
  });

  it("does NOT emit KPI events for non-done transitions", async () => {
    h.task = {
      id: "T-1",
      status: "assigned",
      assigneeId: "u1",
      auditId: "AUD-1",
      due: "2099-12-31",
    };
    await taskTransition({ taskId: "T-1", action: "start" });
    expect(mockPrisma.kpiEvent.create).not.toHaveBeenCalled();
  });
});
