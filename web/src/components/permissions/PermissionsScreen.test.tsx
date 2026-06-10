import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PermissionsScreen } from "./PermissionsScreen";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string, params?: Record<string, unknown>) =>
    params ? `${ns}.${key}(${JSON.stringify(params)})` : `${ns}.${key}`,
}));
vi.mock("@/components/ui/Toast", () => ({ useToast: () => vi.fn() }));
const { saveRolePermissions } = vi.hoisted(() => ({
  saveRolePermissions: vi.fn(),
}));
vi.mock("@/lib/actions/settings", () => ({ saveRolePermissions }));

const setup = () => {
  saveRolePermissions.mockResolvedValue({ ok: true });
  return render(<PermissionsScreen />);
};

describe("PermissionsScreen", () => {
  it("renders the matrix with module rows and role columns", () => {
    const { container } = setup();
    expect(screen.getByText("permissions.title")).toBeInTheDocument();
    expect(screen.getByText("Foydalanuvchilar")).toBeInTheDocument(); // a module row
    expect(screen.getByText("Departament")).toBeInTheDocument(); // super role short
    // users × super = "full" → at least one full cell renders.
    expect(container.querySelectorAll(".perm--full").length).toBeGreaterThan(0);
  });

  it("renders the legend with all four access levels", () => {
    setup();
    for (const k of ["permissions.full", "permissions.read", "permissions.own", "permissions.no"]) {
      expect(screen.getByText(k)).toBeInTheDocument();
    }
  });

  it("opens the permission checklist and saves role permissions", async () => {
    const { container } = setup();
    await userEvent.click(screen.getByRole("button", { name: /permissions\.editMode/ }));
    expect(screen.getByText("permissions.editBannerTitle")).toBeInTheDocument();
    const editable = container.querySelectorAll(".perm--editable");
    expect(editable.length).toBeGreaterThan(0);
    await userEvent.click(editable[0] as Element);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await userEvent.click(screen.getByLabelText("scanner.import"));
    const saveButtons = screen.getAllByRole("button", { name: "permissions.save" });
    await userEvent.click(saveButtons[saveButtons.length - 1]);

    await waitFor(() =>
      expect(saveRolePermissions).toHaveBeenCalledWith(
        expect.objectContaining({ permissions: ["scanner.import"] }),
      ),
    );
  });
});
