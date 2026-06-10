import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { UserFormModal } from "./UserFormModal";

vi.mock("next-intl", () => ({
  useTranslations: (ns: string) => (key: string) => `${ns}.${key}`,
}));
const { createUser, updateUser } = vi.hoisted(() => ({
  createUser: vi.fn(),
  updateUser: vi.fn(),
}));
vi.mock("@/lib/actions/users", () => ({ createUser, updateUser }));
vi.mock("@/components/ui/Toast", () => ({ useToast: () => vi.fn() }));
vi.mock("@/components/ui/Modal", () => ({
  Modal: ({
    open,
    children,
    title,
    footer,
  }: {
    open: boolean;
    children: React.ReactNode;
    title: string;
    footer: React.ReactNode;
  }) =>
    open ? (
      <div>
        <div>{title}</div>
        {children}
        {footer}
      </div>
    ) : null,
}));

describe("UserFormModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createUser.mockResolvedValue({ ok: true });
    updateUser.mockResolvedValue({ ok: true });
  });

  it("does not render when closed", () => {
    render(<UserFormModal open={false} onClose={vi.fn()} />);
    expect(screen.queryByText("users.createTitle")).toBeNull();
  });

  it("renders create title when no user prop", () => {
    render(<UserFormModal open onClose={vi.fn()} />);
    expect(screen.getByText("users.createTitle")).toBeInTheDocument();
  });

  it("renders edit title when user prop provided", () => {
    const user = {
      id: "u1",
      name: "Test",
      email: "t@t.uz",
      role: "t1" as const,
      customRoleCode: null,
      title: "T",
      dept: "D",
      avatar: "TT",
      disabled: false,
      lastLogin: null,
    };
    render(<UserFormModal open onClose={vi.fn()} user={user} />);
    expect(screen.getByText("users.editTitle")).toBeInTheDocument();
  });

  it("shows password field in create mode", () => {
    render(<UserFormModal open onClose={vi.fn()} />);
    expect(screen.getByLabelText("users.fieldPassword")).toBeInTheDocument();
  });

  it("hides password field in edit mode", () => {
    const user = {
      id: "u1",
      name: "Test",
      email: "t@t.uz",
      role: "t1" as const,
      customRoleCode: null,
      title: "T",
      dept: "D",
      avatar: "TT",
      disabled: false,
      lastLogin: null,
    };
    render(<UserFormModal open onClose={vi.fn()} user={user} />);
    expect(screen.queryByLabelText("users.fieldPassword")).toBeNull();
  });

  it("prefills fields in edit mode", () => {
    const user = {
      id: "u1",
      name: "Akmal",
      email: "akmal@gov.uz",
      role: "super" as const,
      customRoleCode: null,
      title: "Rahbar",
      dept: "Apparat",
      avatar: "AK",
      disabled: false,
      lastLogin: null,
    };
    render(<UserFormModal open onClose={vi.fn()} user={user} />);
    expect(screen.getByDisplayValue("Akmal")).toBeInTheDocument();
    expect(screen.getByDisplayValue("akmal@gov.uz")).toBeInTheDocument();
  });

  it("submits an optional custom role code", async () => {
    render(
      <UserFormModal
        open
        onClose={vi.fn()}
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
    await userEvent.type(screen.getByLabelText("users.fieldName"), "Scanner User");
    await userEvent.type(screen.getByLabelText("users.fieldEmail"), "scanner@gov.uz");
    await userEvent.type(screen.getByLabelText("users.fieldPassword"), "secret");
    await userEvent.selectOptions(screen.getByLabelText("users.fieldCustomRole"), "scanner_operator");
    await userEvent.click(screen.getByRole("button", { name: "users.create" }));

    await waitFor(() =>
      expect(createUser).toHaveBeenCalledWith(
        expect.objectContaining({ customRoleCode: "scanner_operator" }),
      ),
    );
  });
});
