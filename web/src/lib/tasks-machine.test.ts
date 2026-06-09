// @vitest-environment node
import { describe, it, expect } from "vitest";
import { actionsFor, canDoTask } from "./tasks-machine";

describe("canDoTask", () => {
  it("lets the assignee start their assigned task", () => {
    expect(canDoTask("start", "assigned", { role: "t1", isAssignee: true }).ok).toBe(true);
  });
  it("forbids a non-assignee non-lead from starting", () => {
    const r = canDoTask("start", "assigned", { role: "t1", isAssignee: false });
    expect(r).toEqual({ ok: false, reason: "forbidden" });
  });
  it("rejects an illegal transition", () => {
    expect(canDoTask("approve", "new", { role: "lead", isAssignee: false }).reason).toBe(
      "illegal_transition",
    );
  });
  it("only lets a lead approve a task in review", () => {
    expect(canDoTask("approve", "review", { role: "t1", isAssignee: false }).reason).toBe(
      "forbidden",
    );
    expect(canDoTask("approve", "review", { role: "lead", isAssignee: false }).ok).toBe(true);
  });
  it("requires a comment to return", () => {
    expect(canDoTask("return", "review", { role: "lead", isAssignee: false }).reason).toBe(
      "comment_required",
    );
    expect(canDoTask("return", "review", { role: "lead", isAssignee: false }, "fix it").ok).toBe(
      true,
    );
  });
});

describe("actionsFor", () => {
  it("offers approve + return in review", () => {
    expect(actionsFor("review").sort()).toEqual(["approve", "return"]);
  });
  it("offers nothing for done", () => {
    expect(actionsFor("done")).toEqual([]);
  });
});
