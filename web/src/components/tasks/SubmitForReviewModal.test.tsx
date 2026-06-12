import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { SubmitForReviewModal } from "./SubmitForReviewModal";

vi.mock("@/lib/actions/tasks", () => ({
  submitTaskForReview: vi.fn(async () => ({ ok: true })),
}));

import { submitTaskForReview } from "@/lib/actions/tasks";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mockSubmit = submitTaskForReview as any;

function setup(open = true) {
  const onClose = vi.fn();
  render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <SubmitForReviewModal open={open} onClose={onClose} taskId="T-1" />
    </NextIntlClientProvider>,
  );
  return { onClose };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("SubmitForReviewModal", () => {
  it("renders nothing when closed", () => {
    setup(false);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the form when open", () => {
    setup();
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText(messages.taskDetail.submitModal.commentLabel)).toBeInTheDocument();
  });

  it("shows error when submitting with empty comment", async () => {
    setup();
    await userEvent.click(
      screen.getByRole("button", { name: messages.taskDetail.submitModal.submit }),
    );
    expect(screen.getByText(messages.taskDetail.submitModal.errorComment)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("shows error when comment is shorter than 10 chars", async () => {
    setup();
    await userEvent.type(
      screen.getByLabelText(messages.taskDetail.submitModal.commentLabel),
      "qisqa",
    );
    await userEvent.click(
      screen.getByRole("button", { name: messages.taskDetail.submitModal.submit }),
    );
    expect(screen.getByText(messages.taskDetail.submitModal.errorComment)).toBeInTheDocument();
    expect(mockSubmit).not.toHaveBeenCalled();
  });

  it("calls submitTaskForReview with FormData on valid submit", async () => {
    setup();
    await userEvent.type(
      screen.getByLabelText(messages.taskDetail.submitModal.commentLabel),
      "Barcha testlar muvaffaqiyatli o'tdi",
    );
    await userEvent.click(
      screen.getByRole("button", { name: messages.taskDetail.submitModal.submit }),
    );
    expect(mockSubmit).toHaveBeenCalledWith(expect.any(FormData));
    const fd: FormData = mockSubmit.mock.calls[0][0];
    expect(fd.get("taskId")).toBe("T-1");
    expect(fd.get("comment")).toBe("Barcha testlar muvaffaqiyatli o'tdi");
  });

  it("calls onClose when cancel is clicked", async () => {
    const { onClose } = setup();
    await userEvent.click(
      screen.getByRole("button", { name: messages.taskDetail.submitModal.cancel }),
    );
    expect(onClose).toHaveBeenCalled();
  });
});
