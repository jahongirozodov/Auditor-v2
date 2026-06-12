import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LogsScreen } from "./LogsScreen";
import type { AuditLogPage, AuditLogView, User } from "@/lib/types/entities";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string, params?: Record<string, unknown>) =>
    params ? `${ns}.${key}(${JSON.stringify(params)})` : `${ns}.${key}`,
}));

const fetchAuditLogs = vi.fn();
vi.mock("@/lib/actions/logs", () => ({
  fetchAuditLogs: (...a: unknown[]) => fetchAuditLogs(...a),
}));

const ROWS: AuditLogView[] = [
  {
    id: "1",
    time: "2026-06-10T09:11:24.000Z",
    userId: "u1",
    userName: "Akmal",
    avatar: "AY",
    action: "auth.login",
    entity: "—",
    ip: "10.0.0.1",
    device: "PC1",
    level: "info",
    payload: { ok: true },
  },
  {
    id: "2",
    time: "2026-06-10T09:10:00.000Z",
    userId: "u9",
    userName: "Sherzod",
    avatar: "SH",
    action: "auth.login.fail",
    entity: "—",
    ip: "10.0.0.2",
    device: "PC2",
    level: "warn",
  },
];

const PAGE: AuditLogPage = {
  rows: ROWS,
  nextCursor: "2",
  total: 9,
  counts: { all: 9, auth: 4, finding: 3, task: 1, config: 1, error: 2 },
};

const USERS: User[] = [
  { id: "u1", name: "Akmal", role: "super", title: "", avatar: "AY", dept: "" },
];

beforeEach(() => {
  vi.clearAllMocks();
  fetchAuditLogs.mockResolvedValue({ ...PAGE, rows: [ROWS[1]], nextCursor: null });
});

function setup(isAdmin = true) {
  return render(<LogsScreen initial={PAGE} isAdmin={isAdmin} users={USERS} />);
}

describe("LogsScreen", () => {
  it("renders the title, rows and a WARN tag", () => {
    setup();
    expect(screen.getByText("logs.title")).toBeInTheDocument();
    expect(screen.getByText("auth.login")).toBeInTheDocument();
    expect(screen.getByText("WARN")).toBeInTheDocument();
    expect(screen.getByText("2026-06-10 09:11:24")).toBeInTheDocument();
  });

  it("fetches server-side when a category chip is clicked", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /logs\.chipFinding/ }));
    expect(fetchAuditLogs).toHaveBeenCalledWith(
      expect.objectContaining({ category: "finding" }),
      undefined,
    );
  });

  it("loads more with the cursor", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /logs\.loadMore/ }));
    expect(fetchAuditLogs).toHaveBeenCalledWith(expect.anything(), "2");
  });

  it("opens the detail drawer with payload on row click", async () => {
    setup();
    await userEvent.click(screen.getByText("auth.login"));
    expect(screen.getByText("logs.detailPayload")).toBeInTheDocument();
    expect(screen.getByText(/"ok": true/)).toBeInTheDocument();
  });

  it("shows the actor filter only for admins", () => {
    const { unmount } = setup(true);
    expect(screen.getByLabelText("logs.filterActor")).toBeInTheDocument();
    unmount();
    setup(false);
    expect(screen.queryByLabelText("logs.filterActor")).toBeNull();
  });

  it("exposes a CSV export link", () => {
    setup();
    const link = screen.getByRole("link", { name: /logs\.export/ });
    expect(link).toHaveAttribute("href", expect.stringContaining("/api/logs/export"));
  });
});
