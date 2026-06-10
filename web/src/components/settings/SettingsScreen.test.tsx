import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsScreen } from "./SettingsScreen";
import { DEFAULT_SETTINGS } from "@/lib/settings-defaults";
import type { CustomRole } from "@/lib/settings-defaults";
import type { KpiRule } from "@/lib/types/entities";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string, params?: Record<string, unknown>) =>
    params ? `${ns}.${key}(${JSON.stringify(params)})` : `${ns}.${key}`,
}));
vi.mock("@/components/ui/Toast", () => ({ useToast: () => vi.fn() }));

const { saveSettings, saveKpiRules, testOllama, addCustomRole, updateCustomRole, deleteCustomRole } =
  vi.hoisted(() => ({
    saveSettings: vi.fn(),
    saveKpiRules: vi.fn(),
    testOllama: vi.fn(),
    addCustomRole: vi.fn(),
    updateCustomRole: vi.fn(),
    deleteCustomRole: vi.fn(),
  }));
vi.mock("@/lib/actions/settings", () => ({
  saveSettings,
  saveKpiRules,
  testOllama,
  addCustomRole,
  updateCustomRole,
  deleteCustomRole,
}));

const KPI: KpiRule[] = [
  { code: "task_completed", label: "Har bir bajarilgan vazifa", points: 5 },
  { code: "task_overdue", label: "Vazifani kechiktirish", points: -5 },
];

const setup = (customRoles: CustomRole[] = []) =>
  render(<SettingsScreen settings={DEFAULT_SETTINGS} customRoles={customRoles} kpiRules={KPI} />);

beforeEach(() => {
  vi.clearAllMocks();
  saveSettings.mockResolvedValue({ ok: true });
  saveKpiRules.mockResolvedValue({ ok: true });
  testOllama.mockResolvedValue({ ok: true, model: "qwen2.5:14b-instruct" });
  addCustomRole.mockResolvedValue({ ok: true });
  updateCustomRole.mockResolvedValue({ ok: true });
  deleteCustomRole.mockResolvedValue({ ok: true });
});

describe("SettingsScreen", () => {
  it("renders the title and the general section by default", () => {
    setup();
    expect(screen.getByText("settings.title")).toBeInTheDocument();
    expect(screen.getByText("settings.orgTitle")).toBeInTheDocument();
    expect(screen.getByDisplayValue(DEFAULT_SETTINGS.general.deptName)).toBeInTheDocument();
  });

  it("switches to the KPI section via the side nav", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /settings\.navKpi/ }));
    expect(screen.getByText("Har bir bajarilgan vazifa")).toBeInTheDocument();
  });

  it("saves the general section", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /^settings\.save$/ }));
    await waitFor(() =>
      expect(saveSettings).toHaveBeenCalledWith(expect.objectContaining({ section: "general" })),
    );
  });

  it("saves the KPI rules", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /settings\.navKpi/ }));
    await userEvent.click(screen.getByRole("button", { name: /settings\.saveRules/ }));
    await waitFor(() => expect(saveKpiRules).toHaveBeenCalled());
  });

  it("creates a custom role with an explicit permission set", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /settings\.navRoles/ }));
    await userEvent.click(screen.getByRole("button", { name: /settings\.addRole/ }));
    await userEvent.type(screen.getByLabelText("settings.roleName"), "Scanner operator");
    await userEvent.type(screen.getByLabelText("settings.roleCode"), "scanner_operator");
    await userEvent.selectOptions(screen.getByLabelText("settings.roleBase"), "lead");
    await userEvent.click(screen.getByLabelText("scanner.import"));
    await userEvent.click(screen.getByRole("button", { name: /settings\.create/ }));

    await waitFor(() =>
      expect(addCustomRole).toHaveBeenCalledWith(
        expect.objectContaining({
          baseRole: "lead",
          permissions: ["scanner.import"],
        }),
      ),
    );
  });

  it("edits an existing custom role permission set", async () => {
    setup([
      {
        name: "Scanner operator",
        code: "scanner_operator",
        baseRole: "t1",
        permissions: ["scanner.import"],
        tone: "tag--info",
      },
    ]);
    await userEvent.click(screen.getByRole("button", { name: /settings\.navRoles/ }));
    await userEvent.click(screen.getByRole("button", { name: /settings\.editRole/ }));
    await userEvent.selectOptions(screen.getByLabelText("settings.roleBase"), "lead");
    await userEvent.click(screen.getByLabelText("ai.use"));
    await userEvent.click(screen.getByRole("button", { name: /^settings\.save$/ }));

    await waitFor(() =>
      expect(updateCustomRole).toHaveBeenCalledWith(
        expect.objectContaining({
          code: "scanner_operator",
          baseRole: "lead",
          permissions: ["scanner.import", "ai.use"],
        }),
      ),
    );
  });

  it("toggles a security switch", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /settings\.navSecurity/ }));
    // RLS default is on → first toggle turns it off.
    const switches = screen.getAllByRole("button", { pressed: true });
    expect(switches.length).toBeGreaterThan(0);
    await userEvent.click(switches[0]);
    // After toggling, at least one switch is now unpressed.
    expect(screen.getAllByRole("button", { pressed: false }).length).toBeGreaterThan(0);
  });
});
