import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Panel } from "./Panel";

describe("Panel", () => {
  it("renders a header with the title and the body content", () => {
    render(
      <Panel title="Faol auditlar" footer={<span>oxiri</span>}>
        <p>tana</p>
      </Panel>,
    );
    expect(screen.getByText("Faol auditlar")).toHaveClass("panel__t");
    expect(screen.getByText("tana")).toBeInTheDocument();
    expect(screen.getByText("oxiri")).toBeInTheDocument();
  });

  it("omits the header when there is no title or actions", () => {
    const { container } = render(
      <Panel>
        <p>x</p>
      </Panel>,
    );
    expect(container.querySelector(".panel__h")).toBeNull();
  });
});
