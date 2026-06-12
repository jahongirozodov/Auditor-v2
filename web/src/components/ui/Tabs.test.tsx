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

  it("renders a disabled tab with title tooltip", () => {
    const TABS_WITH_DISABLED = [
      { id: "overview", label: "Umumiy" },
      { id: "tasks", label: "Vazifalar", disabled: true, disabledTitle: "Loyiha tasdiqlanishi kerak" },
    ];
    render(<Tabs active="overview" onChange={() => {}} tabs={TABS_WITH_DISABLED} />);
    const btn = screen.getByRole("tab", { name: /Vazifalar/ });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("title", "Loyiha tasdiqlanishi kerak");
  });

  it("does not call onChange when a disabled tab is clicked", async () => {
    const onChange = vi.fn();
    const TABS_WITH_DISABLED = [
      { id: "overview", label: "Umumiy" },
      { id: "tasks", label: "Vazifalar", disabled: true, disabledTitle: "Loyiha tasdiqlanishi kerak" },
    ];
    render(<Tabs active="overview" onChange={onChange} tabs={TABS_WITH_DISABLED} />);
    await userEvent.click(screen.getByRole("tab", { name: /Vazifalar/ }), { pointerEventsCheck: 0 });
    expect(onChange).not.toHaveBeenCalled();
  });
});
