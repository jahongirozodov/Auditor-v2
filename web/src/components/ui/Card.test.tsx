import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Card } from "./Card";

describe("Card", () => {
  it("renders the base card with padding wrapper", () => {
    const { container } = render(<Card>salom</Card>);
    expect(container.querySelector(".card")).not.toBeNull();
    expect(container.querySelector(".card__pad")).not.toBeNull();
    expect(screen.getByText("salom")).toBeInTheDocument();
  });

  it("applies soft + hover modifiers and no padding when pad=none", () => {
    const { container } = render(
      <Card soft hover pad="none">
        x
      </Card>,
    );
    const card = container.querySelector(".card")!;
    expect(card).toHaveClass("card--soft");
    expect(card).toHaveClass("card--hover");
    expect(container.querySelector(".card__pad")).toBeNull();
  });
});
