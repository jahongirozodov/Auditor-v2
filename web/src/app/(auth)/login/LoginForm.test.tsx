import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";

// Mock the server action so the test never imports the auth/argon2 server stack.
vi.mock("./actions", () => ({ loginAction: vi.fn(async () => ({})) }));

import { LoginForm } from "./LoginForm";

function renderForm() {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <LoginForm />
    </NextIntlClientProvider>,
  );
}

describe("LoginForm", () => {
  it("renders the title, email and password fields", () => {
    renderForm();
    expect(screen.getByRole("heading", { name: "Tizimga kirish" })).toBeInTheDocument();
    expect(screen.getByLabelText("Login (domen hisobi)")).toBeInTheDocument();
    expect(screen.getByLabelText("Parol")).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    renderForm();
    const pw = screen.getByLabelText("Parol");
    expect(pw).toHaveAttribute("type", "password");
    await userEvent.click(screen.getByRole("button", { name: "Parolni koʻrsatish" }));
    expect(pw).toHaveAttribute("type", "text");
  });

  it("submit button defaults to type=submit; AD button is a disabled stub", () => {
    renderForm();
    expect(screen.getByRole("button", { name: /Kirish/ })).toHaveAttribute("type", "submit");
    expect(screen.getByRole("button", { name: /Domen sertifikati/ })).toBeDisabled();
  });

  it("prefills the demo email", () => {
    renderForm();
    expect(screen.getByLabelText("Login (domen hisobi)")).toHaveValue("a.yoldoshev@gov.uz");
  });
});
