import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar";
import { AvatarStack } from "./AvatarStack";

describe("Avatar", () => {
  it("renders initials with a name title", () => {
    render(<Avatar initials="AY" name="Akmal" />);
    const el = screen.getByText("AY");
    expect(el).toHaveClass("avatar");
    expect(el).toHaveAttribute("title", "Akmal");
  });

  it("applies the size modifier", () => {
    render(<Avatar initials="DR" size="lg" />);
    expect(screen.getByText("DR")).toHaveClass("avatar--lg");
  });
});

describe("AvatarStack", () => {
  it("shows up to max avatars and a +N overflow", () => {
    render(
      <AvatarStack
        max={2}
        items={[{ initials: "A" }, { initials: "B" }, { initials: "C" }, { initials: "D" }]}
      />,
    );
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByText("C")).toBeNull();
    expect(screen.getByText("+2")).toBeInTheDocument();
  });
});
