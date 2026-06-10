import { describe, it, expect, vi, beforeEach } from "vitest";
import { emitKpiEvent, SEVERITY_BONUS, BONUS_PTS } from "./kpi-engine";
import type { Prisma } from "@prisma/client";

// Minimal TransactionClient mock.
function makeTx() {
  return {
    kpiEvent: { create: vi.fn().mockResolvedValue(undefined) },
    kpiUser: { upsert: vi.fn().mockResolvedValue(undefined) },
  } as unknown as Prisma.TransactionClient;
}

describe("emitKpiEvent", () => {
  let tx: ReturnType<typeof makeTx>;

  beforeEach(() => {
    tx = makeTx();
  });

  it("creates a KpiEvent row", async () => {
    await emitKpiEvent(tx, { userId: "u1", ruleCode: "task_completed", points: 5 });
    expect(tx.kpiEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: "u1", ruleCode: "task_completed", points: 5 }),
      }),
    );
  });

  it("upserts KpiUser total increment", async () => {
    await emitKpiEvent(tx, { userId: "u1", ruleCode: "task_completed", points: 5 });
    const call = (tx.kpiUser.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.update).toMatchObject({ total: { increment: 5 } });
  });

  it("increments countField when provided", async () => {
    await emitKpiEvent(tx, {
      userId: "u1",
      ruleCode: "task_completed",
      points: 5,
      countField: "tasks",
    });
    const call = (tx.kpiUser.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.update).toMatchObject({ tasks: { increment: 1 } });
    expect(call.create).toMatchObject({ tasks: 1 });
  });

  it("does NOT increment countField when omitted", async () => {
    await emitKpiEvent(tx, { userId: "u1", ruleCode: "act_as_group_lead", points: 15 });
    const call = (tx.kpiUser.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.update).not.toHaveProperty("tasks");
    expect(call.update).not.toHaveProperty("audits");
    expect(call.update).not.toHaveProperty("findings");
  });

  it("negative points: total.increment is negative", async () => {
    await emitKpiEvent(tx, { userId: "u1", ruleCode: "task_overdue", points: -5 });
    const call = (tx.kpiUser.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.update).toMatchObject({ total: { increment: -5 } });
  });

  it("create path: total = max(0, points) for positive", async () => {
    await emitKpiEvent(tx, { userId: "u99", ruleCode: "task_completed", points: 5 });
    const call = (tx.kpiUser.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.create.total).toBe(5);
  });

  it("create path: total = 0 for negative (new user should not go negative)", async () => {
    await emitKpiEvent(tx, { userId: "u99", ruleCode: "task_overdue", points: -5 });
    const call = (tx.kpiUser.upsert as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.create.total).toBe(0);
  });

  it("passes auditId and payload to kpiEvent.create", async () => {
    await emitKpiEvent(tx, {
      userId: "u1",
      ruleCode: "vuln_approved",
      points: 3,
      auditId: "AUD-1",
      payload: { sev: "critical" },
    });
    const call = (tx.kpiEvent.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(call.data.auditId).toBe("AUD-1");
    expect(call.data.payload).toEqual({ sev: "critical" });
  });
});

describe("SEVERITY_BONUS", () => {
  it("maps each severity to a rule code", () => {
    expect(SEVERITY_BONUS.critical).toBe("vuln_critical_bonus");
    expect(SEVERITY_BONUS.high).toBe("vuln_high_bonus");
    expect(SEVERITY_BONUS.medium).toBe("vuln_medium_bonus");
    expect(SEVERITY_BONUS.low).toBe("vuln_low_bonus");
  });
});

describe("BONUS_PTS", () => {
  it("returns correct points per code", () => {
    expect(BONUS_PTS["vuln_critical_bonus"]).toBe(10);
    expect(BONUS_PTS["vuln_high_bonus"]).toBe(7);
    expect(BONUS_PTS["vuln_medium_bonus"]).toBe(4);
    expect(BONUS_PTS["vuln_low_bonus"]).toBe(1);
  });
});
