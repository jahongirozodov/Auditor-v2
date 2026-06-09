import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Sev } from "./Sev";

describe("Sev", () => {
  it("renders the label and severity class", () => {
    render(<Sev level="critical" />);
    const el = screen.getByText("Critical");
    expect(el).toHaveClass("sev");
    expect(el).toHaveClass("sev--critical");
  });

  it("maps each level", () => {
    render(<Sev level="medium" />);
    expect(screen.getByText("Medium")).toHaveClass("sev--medium");
  });
});
