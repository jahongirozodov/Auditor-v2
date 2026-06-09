import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Tag } from "./Tag";

describe("Tag", () => {
  it("renders children with the base class", () => {
    render(<Tag>Faol</Tag>);
    expect(screen.getByText("Faol")).toHaveClass("tag");
  });

  it("applies the tone modifier", () => {
    render(<Tag tone="danger">Qaytarilgan</Tag>);
    expect(screen.getByText("Qaytarilgan")).toHaveClass("tag--danger");
  });

  it("neutral tone adds no modifier", () => {
    render(<Tag tone="neutral">X</Tag>);
    const el = screen.getByText("X");
    expect(el.className).toBe("tag");
  });
});
