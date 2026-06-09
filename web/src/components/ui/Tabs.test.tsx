import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs } from "./Tabs";

const TABS = [
  { id: "overview", label: "Umumiy" },
  { id: "findings", label: "Findinglar", count: 34 },
];

describe("Tabs", () => {
  it("marks the active tab and shows counts", () => {
    render(<Tabs active="overview" onChange={() => {}} tabs={TABS} />);
    expect(screen.getByRole("tab", { name: "Umumiy" })).toHaveClass("is-active");
    expect(screen.getByRole("tab", { name: /Findinglar/ })).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByText("34")).toBeInTheDocument();
  });

  it("calls onChange with the tab id", async () => {
    const onChange = vi.fn();
    render(<Tabs active="overview" onChange={onChange} tabs={TABS} />);
    await userEvent.click(screen.getByRole("tab", { name: /Findinglar/ }));
    expect(onChange).toHaveBeenCalledWith("findings");
  });
});
