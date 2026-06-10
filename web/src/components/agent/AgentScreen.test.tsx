import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AgentScreen, type AgentScreenProps } from "./AgentScreen";
import { TOKENS, USERS, AUDITS } from "@/lib/fixtures";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string, params?: Record<string, unknown>) =>
    params ? `${ns}.${key}(${JSON.stringify(params)})` : `${ns}.${key}`,
}));
const toast = vi.fn();
vi.mock("@/components/ui/Toast", () => ({ useToast: () => toast }));

const usersById = Object.fromEntries(USERS.map((u) => [u.id, u]));
const auditCodeById = Object.fromEntries(AUDITS.map((a) => [a.id, a.code]));

const props: AgentScreenProps = {
  overview: { activeTokens: 4, connectedDevices: 2, sync24h: 5, anomalies: 1, latestSync: null },
  syncs: [
    {
      id: "asy_1",
      tokenId: TOKENS[0].id,
      auditId: "AUD-2026-014",
      userId: "u6",
      status: "completed",
      findingCount: 3,
      startedAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    },
    {
      id: "asy_2",
      tokenId: TOKENS[1].id,
      auditId: "AUD-2026-014",
      userId: "u7",
      status: "failed",
      findingCount: 0,
      startedAt: new Date().toISOString(),
      completedAt: null,
    },
  ],
  usage: [],
  version: { version: "1.0.0", notes: null, createdAt: new Date().toISOString() },
  tokens: TOKENS,
  usersById,
  auditCodeById,
  syncedFindings: [
    {
      id: "F-2026-0341",
      title: "Agent finding",
      severity: "critical",
      status: "new",
      date: "2026-05-18",
      evidence: 2,
      reportedById: "u6",
      auditId: "AUD-2026-014",
    },
  ],
};

const setup = () => render(<AgentScreen {...props} />);

beforeEach(() => vi.clearAllMocks());

describe("AgentScreen", () => {
  it("renders the four stat tiles", () => {
    setup();
    expect(screen.getByText("agent.statActive")).toBeInTheDocument();
    expect(screen.getByText("agent.statDevices")).toBeInTheDocument();
    expect(screen.getByText("agent.statSync")).toBeInTheDocument();
    expect(screen.getByText("agent.statAnomaly")).toBeInTheDocument();
  });

  it("lists only active tokens in the connected-agents table", () => {
    setup();
    // tk_a91x (active) present; an expired/revoked token id absent even when revealed.
    expect(screen.getByText("agent.tokensTitle")).toBeInTheDocument();
    const activeCount = TOKENS.filter((t) => t.status === "active").length;
    expect(screen.getAllByRole("button", { name: "agent.reveal" })).toHaveLength(activeCount);
  });

  it("masks a token id and reveals it on click", async () => {
    setup();
    expect(screen.queryByText(/tk_a91x/)).toBeNull();
    await userEvent.click(screen.getAllByRole("button", { name: "agent.reveal" })[0]);
    expect(screen.getByText(/tk_/)).toBeInTheDocument();
  });

  it("renders the sync history with finding counts", () => {
    setup();
    expect(screen.getByText("agent.syncTitle")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument(); // findingCount of the first session
  });

  it("renders the synced-findings section with an agent finding", () => {
    setup();
    expect(screen.getByText("agent.syncedTitle")).toBeInTheDocument();
    expect(screen.getByText("Agent finding")).toBeInTheDocument();
    expect(screen.getByText("F-2026-0341")).toBeInTheDocument();
  });

  it("starts a download from the EXE action", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /agent\.download/ }));
    // Fires the "downloading" toast before fetching the binary.
    expect(toast).toHaveBeenCalledWith("agent.downloadStarted", "info");
  });
});
