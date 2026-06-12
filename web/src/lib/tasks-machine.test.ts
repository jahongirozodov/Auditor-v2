// @vitest-environment node
import { describe, it, expect } from "vitest";
import { actionsFor, canDoTask } from "./tasks-machine";

describe("canDoTask", () => {
  it("lets the assignee start their assigned task", () => {
    expect(
      canDoTask("start", "assigned", {
        role: "t1",
        isAssignee: true,
        isAuditLeader: false,
        isSuper: false,
      }).ok,
    ).toBe(true);
  });
  it("forbids a non-assignee non-lead from starting", () => {
    const r = canDoTask("start", "assigned", {
      role: "t1",
      isAssignee: false,
      isAuditLeader: false,
      isSuper: false,
    });
    expect(r).toEqual({ ok: false, reason: "forbidden" });
  });
  it("rejects an illegal transition", () => {
    expect(
      canDoTask("approve", "new", {
        role: "lead",
        isAssignee: false,
        isAuditLeader: true,
        isSuper: false,
      }).reason,
    ).toBe("illegal_transition");
  });
  it("only lets the audit leader approve (stage 1: review → review_head)", () => {
    expect(
      canDoTask("approve", "review", {
        role: "lead",
        isAssignee: false,
        isAuditLeader: false,
        isSuper: false,
      }).reason,
    ).toBe("forbidden");
    const r = canDoTask("approve", "review", {
      role: "t1",
      isAssignee: false,
      isAuditLeader: true,
      isSuper: false,
    });
    expect(r.ok).toBe(true);
    expect(r.to).toBe("review_head");
  });
  it("only lets head/super approve stage 2 (review_head → done)", () => {
    expect(
      canDoTask("approve_head", "review_head", {
        role: "chief",
        isAssignee: false,
        isAuditLeader: true,
        isSuper: false,
      }).reason,
    ).toBe("forbidden");
    const r = canDoTask("approve_head", "review_head", {
      role: "head",
      isAssignee: false,
      isAuditLeader: false,
      isSuper: false,
    });
    expect(r.ok).toBe(true);
    expect(r.to).toBe("done");
  });
  it("forbids self-approval and self-return even for audit leaders and super", () => {
    expect(
      canDoTask("approve", "review", {
        role: "lead",
        isAssignee: true,
        isAuditLeader: true,
        isSuper: false,
      }).reason,
    ).toBe("forbidden");
    expect(
      canDoTask(
        "return",
        "review",
        { role: "super", isAssignee: true, isAuditLeader: false, isSuper: true },
        "fix it",
      ).reason,
    ).toBe("forbidden");
  });
  it("requires a comment to return from either review stage", () => {
    expect(
      canDoTask("return", "review", {
        role: "lead",
        isAssignee: false,
        isAuditLeader: true,
        isSuper: false,
      }).reason,
    ).toBe("comment_required");
    expect(
      canDoTask(
        "return",
        "review",
        { role: "lead", isAssignee: false, isAuditLeader: true, isSuper: false },
        "fix it",
      ).ok,
    ).toBe(true);
    expect(
      canDoTask(
        "return",
        "review_head",
        { role: "head", isAssignee: false, isAuditLeader: false, isSuper: false },
        "fix it",
      ).ok,
    ).toBe(true);
  });
  it("requires a comment to submit a task for review", () => {
    const ctx = { role: "t1" as const, isAssignee: true, isAuditLeader: false, isSuper: false };
    expect(canDoTask("submit", "in_progress", ctx).reason).toBe("comment_required");
    expect(canDoTask("submit", "in_progress", ctx, "Vazifa bajarildi, dalillar yuklandi").ok).toBe(
      true,
    );
  });
});

describe("actionsFor", () => {
  it("offers approve + return in review to an audit leader reviewing someone else", () => {
    expect(
      actionsFor("review", {
        role: "lead",
        isAssignee: false,
        isAuditLeader: true,
        isSuper: false,
      }).sort(),
    ).toEqual(["approve", "return"]);
  });
  it("does not offer approve + return for self-assigned review tasks", () => {
    expect(
      actionsFor("review", {
        role: "lead",
        isAssignee: true,
        isAuditLeader: true,
        isSuper: false,
      }),
    ).toEqual([]);
  });
  it("keeps existing non-review role actions outside the self-review fix scope", () => {
    expect(
      actionsFor("assigned", {
        role: "lead",
        isAssignee: false,
        isAuditLeader: false,
        isSuper: false,
      }),
    ).toEqual(["start"]);
  });
  it("offers approve_head + return in review_head to head", () => {
    expect(
      actionsFor("review_head", {
        role: "head",
        isAssignee: false,
        isAuditLeader: false,
        isSuper: false,
      }).sort(),
    ).toEqual(["approve_head", "return"]);
  });
  it("offers nothing for done", () => {
    expect(actionsFor("done")).toEqual([]);
  });
});
