import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { MyTasksScreen } from "./MyTasksScreen";

function renderScreen() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <MyTasksScreen />
    </NextIntlClientProvider>,
  );
}

describe("MyTasksScreen", () => {
  it("renders kanban columns and a task card linking to detail", () => {
    const { container } = renderScreen();
    expect(screen.getByRole("heading", { name: "Mening vazifalarim" })).toBeInTheDocument();
    expect(container.querySelectorAll(".kanban__col")).toHaveLength(5);
    const card = screen.getByRole("link", { name: /Firewall qoidalari/ });
    expect(card).toHaveClass("k-card");
    expect(card).toHaveAttribute("href", "/tasks/T-114");
  });

  it("groups tasks under the correct status column", () => {
    const { container } = renderScreen();
    // "blocked" column (4th) contains T-121
    const blockedCol = container.querySelectorAll(".kanban__col")[3];
    expect(blockedCol.textContent).toContain("T-121");
  });
});
