import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusTag } from "./StatusTag";

describe("StatusTag", () => {
  it("renders the localized label with the right tone", () => {
    render(<StatusTag status="in_progress" />);
    const el = screen.getByText("Jarayonda");
    expect(el).toHaveClass("tag");
    expect(el).toHaveClass("tag--info");
  });

  it("maps returned → danger and approved → success", () => {
    const { rerender } = render(<StatusTag status="returned" />);
    expect(screen.getByText("Qaytarilgan")).toHaveClass("tag--danger");
    rerender(<StatusTag status="approved" />);
    expect(screen.getByText("Tasdiqlangan")).toHaveClass("tag--success");
  });
});
