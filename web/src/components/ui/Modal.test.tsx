import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Modal } from "./Modal";

describe("Modal", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <Modal open={false} onClose={() => {}} title="X">
        body
      </Modal>,
    );
    expect(container.firstChild).toBeNull();
  });

  it("shows the title + body and closes on Escape", async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="Yangi audit">
        <p>tana</p>
      </Modal>,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Yangi audit")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalled();
  });

  it("closes on the X button", async () => {
    const onClose = vi.fn();
    render(
      <Modal open onClose={onClose} title="X">
        y
      </Modal>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Yopish" }));
    expect(onClose).toHaveBeenCalled();
  });
});
