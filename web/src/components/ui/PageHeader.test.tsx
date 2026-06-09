import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "./PageHeader";

describe("PageHeader", () => {
  it("renders the title, subtitle and actions", () => {
    render(
      <PageHeader title="Boshqaruv paneli" sub="Umumiy holat" actions={<button>Yangi</button>} />,
    );
    expect(screen.getByRole("heading", { name: "Boshqaruv paneli" })).toBeInTheDocument();
    expect(screen.getByText("Umumiy holat")).toHaveClass("pageh__sub");
    expect(screen.getByRole("button", { name: "Yangi" })).toBeInTheDocument();
  });

  it("renders breadcrumbs with links", () => {
    render(
      <PageHeader
        title="Detal"
        crumbs={[{ label: "Auditlar", href: "/audits" }, { label: "AUD-1" }]}
      />,
    );
    expect(screen.getByRole("link", { name: "Auditlar" })).toHaveAttribute("href", "/audits");
  });
});
