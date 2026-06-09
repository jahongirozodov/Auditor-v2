// @vitest-environment node
import { describe, it, expect } from "vitest";
import { canDoRemediation, remediationActionsFor } from "./findings-machine";

const assignee = { role: "t1" as const, isAssignee: true };
const otherT1 = { role: "t1" as const, isAssignee: false };
const lead = { role: "lead" as const, isAssignee: false };

describe("canDoRemediation", () => {
  it("lets the assignee start fixing an approved finding", () => {
    expect(canDoRemediation("startFixing", "approved", assignee)).toEqual({
      ok: true,
      to: "fixing",
    });
  });

  it("lets a lead start fixing too", () => {
    expect(canDoRemediation("startFixing", "approved", lead).ok).toBe(true);
  });

  it("forbids a non-assignee t1 from fixing", () => {
    expect(canDoRemediation("startFixing", "approved", otherT1)).toEqual({
      ok: false,
      reason: "forbidden",
    });
  });

  it("restricts retest to a lead", () => {
    expect(canDoRemediation("startRetest", "fixed", assignee)).toEqual({
      ok: false,
      reason: "forbidden",
    });
    expect(canDoRemediation("startRetest", "fixed", lead)).toEqual({ ok: true, to: "retest" });
  });

  it("passes retest → closed", () => {
    expect(canDoRemediation("passRetest", "retest", lead)).toEqual({ ok: true, to: "closed" });
  });

  it("requires a comment to fail a retest, then loops to fixing", () => {
    expect(canDoRemediation("failRetest", "retest", lead)).toEqual({
      ok: false,
      reason: "comment_required",
    });
    expect(canDoRemediation("failRetest", "retest", lead, "still open")).toEqual({
      ok: true,
      to: "fixing",
    });
  });

  it("rejects an illegal transition (cannot fix a finding still in review)", () => {
    expect(canDoRemediation("startFixing", "review", lead)).toEqual({
      ok: false,
      reason: "illegal_transition",
    });
  });
});

describe("remediationActionsFor", () => {
  it("returns the actions available per status", () => {
    expect(remediationActionsFor("approved")).toEqual(["startFixing"]);
    expect(remediationActionsFor("retest")).toEqual(["passRetest", "failRetest"]);
    expect(remediationActionsFor("closed")).toEqual([]);
  });
});
