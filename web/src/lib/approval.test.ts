// @vitest-environment node
import { describe, it, expect } from "vitest";
import { canActAt, currentOf, nextStage, projectCurrentOf } from "./approval";

describe("canActAt", () => {
  it("gates dept to super only", () => {
    expect(canActAt("super", "dept")).toBe(true);
    expect(canActAt("head", "dept")).toBe(false);
    expect(canActAt("t1", "dept")).toBe(false);
  });
  it("lets chief/lead act at group_lead but not head", () => {
    expect(canActAt("lead", "group_lead")).toBe(true);
    expect(canActAt("lead", "head")).toBe(false);
    expect(canActAt("head", "head")).toBe(true);
  });
});

describe("nextStage", () => {
  it("advances group_lead → head → dept → null", () => {
    expect(nextStage("group_lead")).toBe("head");
    expect(nextStage("head")).toBe("dept");
    expect(nextStage("dept")).toBeNull();
  });
});

describe("currentOf", () => {
  it("maps status + stage onto the approval strip", () => {
    expect(currentOf("new", null)).toBe("new");
    expect(currentOf("returned", null)).toBe("returned");
    expect(currentOf("review", "head")).toBe("head");
    expect(currentOf("review", null)).toBe("group_lead");
    expect(currentOf("approved", null)).toBeNull();
    expect(currentOf("fixing", null)).toBeNull();
  });
});

describe("projectCurrentOf", () => {
  it("maps the audit status onto the project strip (group_lead is the submitter)", () => {
    expect(projectCurrentOf("project_draft", null)).toBe("new");
    expect(projectCurrentOf("project_pending", null)).toBe("head"); // first approver after submit
    expect(projectCurrentOf("project_pending", "dept")).toBe("dept");
    expect(projectCurrentOf("returned", null)).toBe("returned");
    expect(projectCurrentOf("assigning", null)).toBeNull();
    expect(projectCurrentOf("in_progress", null)).toBeNull();
  });
});
