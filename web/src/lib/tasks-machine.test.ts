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
  it("only lets the audit leader approve another user's task in review", () => {
    expect(
      canDoTask("approve", "review", {
        role: "lead",
        isAssignee: false,
        isAuditLeader: false,
        isSuper: false,
      }).reason,
    ).toBe("forbidden");
    expect(
      canDoTask("approve", "review", {
        role: "t1",
        isAssignee: false,
        isAuditLeader: true,
        isSuper: false,
      }).ok,
    ).toBe(true);
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
  it("requires a comment to return after actor authorization passes", () => {
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
  it("offers nothing for done", () => {
    expect(actionsFor("done")).toEqual([]);
  });
});
