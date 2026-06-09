import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field, Input } from "./Field";

describe("Field", () => {
  it("associates the label with the control and shows the hint", () => {
    render(
      <Field label="Login" htmlFor="email" hint="domen hisobi">
        <Input id="email" />
      </Field>,
    );
    expect(screen.getByLabelText("Login")).toHaveClass("input");
    expect(screen.getByText("domen hisobi")).toHaveClass("field__hint");
  });
});

describe("Input", () => {
  it("renders a bare input by default", () => {
    const { container } = render(<Input placeholder="x" />);
    expect(container.querySelector(".input-group")).toBeNull();
    expect(screen.getByPlaceholderText("x")).toHaveClass("input");
  });

  it("wraps in input-group when given a leading icon", () => {
    const { container } = render(<Input iconLeft={<i className="icon-l" />} placeholder="y" />);
    expect(container.querySelector(".input-group")).not.toBeNull();
  });
});
