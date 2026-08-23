import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoleSelectionScreen } from "./role-selection-screen";
import { useAuthStore } from "@/store/auth-store";
import { ROLE_DEFINITIONS, ROLES } from "@/lib/roles";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: jest.fn(),
  }),
}));

describe("RoleSelectionScreen", () => {
  beforeEach(() => {
    pushMock.mockClear();
    useAuthStore.setState({ role: null });
  });

  it("renders a selectable card for every role", () => {
    render(<RoleSelectionScreen />);

    for (const role of ROLES) {
      const card = screen.getByTestId(`role-card-${role}`);
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent(ROLE_DEFINITIONS[role].label);
    }
  });

  it("exposes an accessible radiogroup of exactly four roles", () => {
    render(<RoleSelectionScreen />);

    const group = screen.getByRole("radiogroup", { name: /rolünüzü seçin/i });
    expect(group).toBeInTheDocument();

    const options = screen.getAllByRole("radio");
    expect(options).toHaveLength(4);
  });

  it.each(ROLES)(
    "sets the %s role in the auth store and navigates to its dashboard",
    async (role) => {
      const user = userEvent.setup();
      render(<RoleSelectionScreen />);

      await user.click(screen.getByTestId(`role-card-${role}`));

      expect(useAuthStore.getState().role).toBe(role);
      expect(pushMock).toHaveBeenCalledTimes(1);
      expect(pushMock).toHaveBeenCalledWith(ROLE_DEFINITIONS[role].dashboardPath);
    },
  );

  it("navigates to a different dashboard when a different role is selected afterwards", async () => {
    const user = userEvent.setup();
    render(<RoleSelectionScreen />);

    await user.click(screen.getByTestId("role-card-REFEREE"));
    expect(pushMock).toHaveBeenLastCalledWith("/dashboard/referee");

    await user.click(screen.getByTestId("role-card-COMPETITOR"));
    expect(pushMock).toHaveBeenLastCalledWith("/dashboard/competitor");
    expect(useAuthStore.getState().role).toBe("COMPETITOR");
  });
});
