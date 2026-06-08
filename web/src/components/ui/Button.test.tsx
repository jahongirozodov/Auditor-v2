import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders children and the base class", () => {
    render(<Button>Saqlash</Button>);
    const btn = screen.getByRole("button", { name: "Saqlash" });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveClass("btn");
  });

  it("applies variant and size classes", () => {
    render(
      <Button variant="primary" size="sm">
        Qoʻshish
      </Button>,
    );
    const btn = screen.getByRole("button", { name: "Qoʻshish" });
    expect(btn).toHaveClass("btn--primary");
    expect(btn).toHaveClass("btn--sm");
  });

  it("adds btn--icon when iconOnly", () => {
    render(<Button iconOnly aria-label="Yopish" icon={<svg />} />);
    expect(screen.getByRole("button", { name: "Yopish" })).toHaveClass("btn--icon");
  });

  it("defaults to type=button (no implicit submit)", () => {
    render(<Button>Bekor qilish</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "button");
  });

  it("fires onClick", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Tasdiqlash</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Tasdiqlash" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("does not fire onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button onClick={onClick} disabled>
        Tasdiqlash
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Tasdiqlash" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
