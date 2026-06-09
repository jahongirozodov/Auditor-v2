import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ToastProvider, useToast } from "./Toast";

function Trigger() {
  const toast = useToast();
  return (
    <button type="button" onClick={() => toast("Saqlandi", "success")}>
      saqla
    </button>
  );
}

describe("Toast", () => {
  it("shows a toast when triggered", async () => {
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    expect(screen.queryByRole("status")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "saqla" }));
    const toast = screen.getByRole("status");
    expect(toast).toHaveClass("toast--success");
    expect(toast).toHaveTextContent("Saqlandi");
  });
});
