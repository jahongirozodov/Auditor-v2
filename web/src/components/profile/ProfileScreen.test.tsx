import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileScreen } from "./ProfileScreen";
import type { ProfileData } from "@/lib/data/profile";

const MONTHS = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun"];

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("next/link", () => ({
  default: ({ children }: { children: React.ReactNode }) => <a>{children}</a>,
}));
vi.mock("next-intl", () => ({
  useTranslations: () =>
    Object.assign(
      (key: string, p?: Record<string, unknown>) => (p ? `${key}(${JSON.stringify(p)})` : key),
      { raw: (key: string) => (key === "kpiMonths" ? MONTHS : key) },
    ),
}));
vi.mock("@/components/ui/Toast", () => ({ useToast: () => vi.fn() }));

const updateOwnProfile = vi.fn().mockResolvedValue({ ok: true });
const changeOwnPassword = vi.fn().mockResolvedValue({ ok: true });
vi.mock("@/lib/actions/profile", () => ({
  updateOwnProfile: (...a: unknown[]) => updateOwnProfile(...a),
  changeOwnPassword: (...a: unknown[]) => changeOwnPassword(...a),
  setLocale: vi.fn().mockResolvedValue({ ok: true }),
}));
vi.mock("@/app/(app)/actions", () => ({ logoutAction: vi.fn() }));

const DATA: ProfileData = {
  user: {
    id: "u1",
    name: "Akmal Yoldoshev",
    role: "super",
    title: "Departament rahbari",
    avatar: "AY",
    dept: "Kiberxavfsizlik departamenti",
    email: "a.yoldoshev@gov.uz",
    phone: "+998 90 123-45-67",
    workPhone: null,
  },
  kpi: {
    user: "u1",
    audits: 6,
    tasks: 28,
    findings: 19,
    total: 412,
    delta: 12,
    sparkline: [10, 20, 18, 30, 28, 40],
  },
  myAudits: [],
  myTasks: [],
  myFindings: [],
  activity: [
    {
      id: "L1",
      time: "2026-06-10T09:42:00.000Z",
      userId: "u1",
      userName: "Akmal",
      avatar: "AY",
      action: "profile.update",
      entity: "u1",
      ip: "10.0.0.1",
      device: "Chrome",
      level: "info",
    },
  ],
  tokens: [],
  lastLogin: "2026-06-10T09:42:00.000Z",
};

function setup() {
  return render(<ProfileScreen data={DATA} />);
}

describe("ProfileScreen", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders the hero with name and KPI score", () => {
    setup();
    expect(screen.getByText("Akmal Yoldoshev")).toBeInTheDocument();
    expect(screen.getByText("412")).toBeInTheDocument();
    expect(screen.getByText("a.yoldoshev@gov.uz")).toBeInTheDocument();
  });

  it("shows the overview tab by default (KPI dynamics)", () => {
    setup();
    expect(screen.getByText("kpiDynamics")).toBeInTheDocument();
  });

  it("switches to the security tab and shows the password fields", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: /tabSecurity/ }));
    expect(screen.getByText("passwordTitle")).toBeInTheDocument();
    expect(screen.getByText("changePassword")).toBeInTheDocument();
  });

  it("validates the password change (mismatch does not call the action via button stays usable)", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: /tabSecurity/ }));
    await userEvent.type(screen.getByLabelText("fieldCurrent"), "oldpass");
    await userEvent.type(screen.getByLabelText("fieldNew"), "newpass12");
    await userEvent.type(screen.getByLabelText("fieldConfirm"), "newpass12");
    await userEvent.click(screen.getByText("changePassword"));
    expect(changeOwnPassword).toHaveBeenCalledWith({
      current: "oldpass",
      next: "newpass12",
      confirm: "newpass12",
    });
  });

  it("switches to settings and submits the profile info form", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: /tabSettings/ }));
    expect(screen.getByText("personalInfo")).toBeInTheDocument();
    await userEvent.click(screen.getByText("save"));
    expect(updateOwnProfile).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Akmal Yoldoshev" }),
    );
  });

  it("switches to the activity tab and shows the log action", async () => {
    setup();
    await userEvent.click(screen.getByRole("tab", { name: /tabActivity/ }));
    expect(screen.getByText("profile.update")).toBeInTheDocument();
  });
});
