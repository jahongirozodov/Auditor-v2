import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Stat } from "./Stat";

describe("Stat", () => {
  it("renders label, value and a positive delta", () => {
    const { container } = render(<Stat label="Auditlar" value={12} delta={6} meta="faol" />);
    expect(screen.getByText("Auditlar")).toHaveClass("stat__label");
    expect(container.querySelector(".stat__value")?.textContent).toBe("12");
    const delta = container.querySelector(".stat__delta")!;
    expect(delta).not.toHaveClass("stat__delta--neg");
    expect(delta.textContent).toContain("+6");
  });

  it("marks a negative delta", () => {
    const { container } = render(<Stat label="x" value={1} delta={-18} deltaNeg />);
    expect(container.querySelector(".stat__delta")).toHaveClass("stat__delta--neg");
  });

  it("renders a progress bar when bar is given", () => {
    const { container } = render(<Stat label="x" value={1} bar={64} />);
    expect(container.querySelector(".stat__bar > span")).toHaveStyle({ width: "64%" });
  });
});
