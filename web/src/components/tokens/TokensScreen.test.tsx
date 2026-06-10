import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TokensScreen } from "./TokensScreen";
import { TOKENS, USERS, AUDITS } from "@/lib/fixtures";

const refresh = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string, params?: Record<string, unknown>) =>
    params ? `${ns}.${key}(${JSON.stringify(params)})` : `${ns}.${key}`,
}));
vi.mock("@/components/ui/Toast", () => ({ useToast: () => vi.fn() }));

const { issueToken, revokeToken, rotateToken } = vi.hoisted(() => ({
  issueToken: vi.fn(),
  revokeToken: vi.fn(),
  rotateToken: vi.fn(),
}));
vi.mock("@/lib/actions/tokens", () => ({ issueToken, revokeToken, rotateToken }));

const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));
const setup = () =>
  render(<TokensScreen tokens={TOKENS} usersById={usersById} audits={AUDITS} users={USERS} />);

beforeEach(() => {
  vi.clearAllMocks();
  issueToken.mockResolvedValue({ ok: true, id: "tk_new" });
  revokeToken.mockResolvedValue({ ok: true });
  rotateToken.mockResolvedValue({ ok: true, id: "tk_new" });
});

describe("TokensScreen", () => {
  it("renders the stat row and a token row", () => {
    setup();
    expect(screen.getByText("tokens.statActive")).toBeInTheDocument();
    expect(screen.getByText("ms-laptop")).toBeInTheDocument(); // a device hostname
  });

  it("masks the token id and reveals it on click", async () => {
    setup();
    expect(screen.queryByText(/tk_a91x/)).toBeNull(); // masked by default
    await userEvent.click(screen.getAllByRole("button", { name: "tokens.reveal" })[0]);
    expect(screen.getByText(/tk_a91x/)).toBeInTheDocument();
  });

  it("opens the issue-token modal", async () => {
    setup();
    await userEvent.click(screen.getAllByRole("button", { name: /tokens\.issue/ })[0]);
    expect(screen.getByText("tokens.issueTitle")).toBeInTheDocument();
  });

  it("revokes a token through the confirm modal", async () => {
    setup();
    await userEvent.click(screen.getAllByRole("button", { name: "tokens.revoke" })[0]);
    expect(screen.getByText("tokens.revokeTitle")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "tokens.revokeConfirm" }));
    await waitFor(() => expect(revokeToken).toHaveBeenCalled());
  });
});
