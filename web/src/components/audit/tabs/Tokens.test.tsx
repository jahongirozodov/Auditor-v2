import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/../messages/uz.json";
import { Tokens } from "./Tokens";
import { AUDITS, TOKENS, USERS } from "@/lib/fixtures";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/lib/actions/tokens", () => ({ issueToken: vi.fn(async () => ({ ok: true, id: "tk_x" })) }));

const audit = AUDITS.find((a) => a.id === "AUD-2026-014")!;
const tokens = TOKENS.filter((t) => t.audit === audit.id);
const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));

function renderTab(canIssue = false, tokenList = tokens) {
  return render(
    <NextIntlClientProvider locale="uz" messages={messages}>
      <Tokens audit={audit} tokens={tokenList} usersById={usersById} canIssue={canIssue} />
    </NextIntlClientProvider>,
  );
}

beforeEach(() => vi.clearAllMocks());

describe("Tokens tab", () => {
  it("renders a row per audit token", () => {
    renderTab();
    expect(tokens.length).toBeGreaterThan(0);
    expect(screen.getByText(tokens[0].id)).toBeInTheDocument();
  });

  it("hides the issue button when canIssue is false", () => {
    renderTab(false);
    expect(screen.queryByRole("button", { name: /Token chiqarish/ })).toBeNull();
  });

  it("shows the issue button and opens the modal when canIssue is true", async () => {
    renderTab(true);
    await userEvent.click(screen.getByRole("button", { name: /Token chiqarish/ }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });

  it("shows the empty state when the audit has no tokens", () => {
    renderTab(false, []);
    expect(screen.getByText("Bu audit uchun hali token chiqarilmagan.")).toBeInTheDocument();
  });
});
