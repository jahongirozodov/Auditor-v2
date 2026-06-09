import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Progress } from "./Progress";

describe("Progress", () => {
  it("exposes a progressbar with the clamped value", () => {
    render(<Progress value={64} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveClass("progress");
    expect(bar).toHaveAttribute("aria-valuenow", "64");
    expect(bar.querySelector("span")).toHaveStyle({ width: "64%" });
  });

  it("clamps out-of-range values", () => {
    render(<Progress value={150} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "100");
  });

  it("applies a tone modifier", () => {
    render(<Progress value={10} tone="danger" />);
    expect(screen.getByRole("progressbar")).toHaveClass("progress--danger");
  });
});
