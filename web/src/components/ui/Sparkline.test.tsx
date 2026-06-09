import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { Sparkline } from "./Sparkline";

describe("Sparkline", () => {
  it("renders an svg with line and area paths", () => {
    const { container } = render(<Sparkline data={[1, 4, 2, 6, 5]} />);
    expect(container.querySelector("svg.spark")).not.toBeNull();
    expect(container.querySelector("path.spark-line")).not.toBeNull();
    expect(container.querySelector("path.spark-area")).not.toBeNull();
  });

  it("omits the area when fill=false and renders nothing for empty data", () => {
    const { container, rerender } = render(<Sparkline data={[1, 2, 3]} fill={false} />);
    expect(container.querySelector("path.spark-area")).toBeNull();
    rerender(<Sparkline data={[]} />);
    expect(container.querySelector("svg")).toBeNull();
  });
});
