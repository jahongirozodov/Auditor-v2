import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CountUp } from "./CountUp";

// Reduced motion is ON in tests (see src/test/setup.ts) → CountUp shows the final
// value immediately.
describe("CountUp", () => {
  it("renders the final value (reduced motion)", () => {
    render(<CountUp value="89%" />);
    expect(screen.getByText("89%")).toBeInTheDocument();
  });

  it("passes non-numeric and formatted values through", () => {
    render(<CountUp value="72/100" />);
    expect(screen.getByText("72/100")).toBeInTheDocument();
  });

  it("forwards className", () => {
    render(<CountUp value={42} className="stat__value" />);
    expect(screen.getByText("42")).toHaveClass("stat__value");
  });
});
