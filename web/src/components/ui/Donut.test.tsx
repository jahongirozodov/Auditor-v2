import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Donut } from "./Donut";

const ITEMS = [
  { value: 4, color: "var(--status-danger-fg)" },
  { value: 9, color: "var(--status-warning-fg)" },
  { value: 14, color: "var(--status-info-fg)" },
];

describe("Donut", () => {
  it("renders one segment per item plus the total", () => {
    const { container } = render(<Donut items={ITEMS} />);
    expect(container.querySelector("svg.donut")).not.toBeNull();
    expect(container.querySelectorAll("circle.donut-seg")).toHaveLength(3);
    // total (4+9+14 = 27) shown in the centre (reduced motion → drawn immediately)
    expect(container.textContent).toContain("27");
    expect(container.textContent).toContain("JAMI");
  });

  it("respects an explicit total", () => {
    const { container } = render(<Donut items={ITEMS} total={100} />);
    expect(container.textContent).toContain("100");
  });
});
