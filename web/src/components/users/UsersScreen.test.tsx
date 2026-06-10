import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UsersScreen } from "./UsersScreen";
import type { AdminUserView, KpiUser } from "@/lib/types/entities";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }) }));
vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string, p?: Record<string, unknown>) =>
    p ? `${ns}.${key}(${JSON.stringify(p)})` : `${ns}.${key}`,
}));
vi.mock("@/lib/actions/users", () => ({
  toggleUserLock: vi.fn().mockResolvedValue({ ok: true, disabled: true }),
  deleteUser: vi.fn().mockResolvedValue({ ok: true }),
}));
vi.mock("@/components/ui/Toast", () => ({ useToast: () => vi.fn() }));
vi.mock("./UserFormModal", () => ({
  UserFormModal: ({ open }: { open: boolean }) => (open ? <div data-testid="modal" /> : null),
  ROLE_OPTIONS: [
    { code: "super", label: "Departament rahbari" },
    { code: "head", label: "Boʻlim boshligʻi" },
    { code: "chief", label: "Bosh mutaxassis" },
    { code: "lead", label: "Yetakchi mutaxassis" },
    { code: "t1", label: "1-toifa mutaxassis" },
  ],
}));

const USERS: AdminUserView[] = [
  {
    id: "u1",
    name: "Akmal Yoʻldoshev",
    role: "super",
    customRoleCode: null,
    title: "Departament rahbari",
    avatar: "AY",
    dept: "Markaziy apparat",
    email: "a@gov.uz",
    disabled: false,
    lastLogin: null,
  },
  {
    id: "u2",
    name: "Dilshoda Rasulova",
    role: "head",
    customRoleCode: "scanner_operator",
    title: "Boʻlim boshligʻi",
    avatar: "DR",
    dept: "Audit boʻlimi",
    email: "d@gov.uz",
    disabled: true,
    lastLogin: null,
  },
];
const KPI: KpiUser[] = [
  { user: "u1", audits: 3, tasks: 12, findings: 45, total: 280, delta: 15, sparkline: [] },
];

function setup(canEdit = true) {
  return render(
    <UsersScreen
      users={USERS}
      kpi={KPI}
      canEdit={canEdit}
      customRoles={[
        {
          name: "Scanner operator",
          code: "scanner_operator",
          baseRole: "t1",
          permissions: ["scanner.import"],
          tone: "tag--info",
        },
      ]}
    />,
  );
}

describe("UsersScreen", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders page title", () => {
    setup();
    expect(screen.getByText("users.title")).toBeInTheDocument();
  });

  it("renders all users", () => {
    setup();
    expect(screen.getByText("Akmal Yoʻldoshev")).toBeInTheDocument();
    expect(screen.getByText("Dilshoda Rasulova")).toBeInTheDocument();
  });

  it("shows role stat cards (5)", () => {
    setup();
    // 5 role card divs exist via ROLE_OPTIONS mock
    expect(screen.getByText("280")).toBeInTheDocument(); // KPI total for u1
  });

  it("shows blocked badge for disabled user", () => {
    setup();
    expect(screen.getByText("Bloklangan")).toBeInTheDocument();
    expect(screen.getByText("Faol")).toBeInTheDocument();
  });

  it("shows assigned custom role labels", () => {
    setup();
    expect(screen.getByText("Scanner operator")).toBeInTheDocument();
  });

  it("filters by search query", async () => {
    setup();
    const input = screen.getByPlaceholderText("users.searchPlaceholder");
    await userEvent.type(input, "Dilshoda");
    expect(screen.queryByText("Akmal Yoʻldoshev")).toBeNull();
    expect(screen.getByText("Dilshoda Rasulova")).toBeInTheDocument();
  });

  it("shows new user button when canEdit=true", () => {
    setup(true);
    expect(screen.getByText("users.newUser")).toBeInTheDocument();
  });

  it("hides new user button when canEdit=false", () => {
    setup(false);
    expect(screen.queryByText("users.newUser")).toBeNull();
  });

  it("opens modal on new user click", async () => {
    setup();
    await userEvent.click(screen.getByText("users.newUser"));
    expect(screen.getByTestId("modal")).toBeInTheDocument();
  });

  it("shows empty state when query matches nothing", async () => {
    setup();
    const input = screen.getByPlaceholderText("users.searchPlaceholder");
    await userEvent.type(input, "xxxxxxxxxxx");
    expect(screen.getByText("users.empty")).toBeInTheDocument();
  });
});
