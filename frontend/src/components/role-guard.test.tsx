import { render, screen } from "@testing-library/react";
import { RoleGuard } from "./role-guard";
import { useAuthStore } from "@/store/auth-store";
import { ROLE_DEFINITIONS, ROLES, type Role } from "@/lib/roles";

const replaceMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: replaceMock,
  }),
}));

function renderGuard(requiredRole: Role) {
  return render(
    <RoleGuard requiredRole={requiredRole}>
      <div data-testid="protected-content">Protected content for {requiredRole}</div>
    </RoleGuard>,
  );
}

describe("RoleGuard", () => {
  beforeEach(() => {
    replaceMock.mockClear();
    useAuthStore.setState({ role: null });
  });

  it("redirects unauthenticated users to the login screen", () => {
    renderGuard("COMPETITION_MANAGER");

    expect(replaceMock).toHaveBeenCalledTimes(1);
    expect(replaceMock).toHaveBeenCalledWith("/");
    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
  });

  it("renders protected content when the authenticated role matches the required role", () => {
    useAuthStore.setState({ role: "REFEREE" });

    renderGuard("REFEREE");

    expect(replaceMock).not.toHaveBeenCalled();
    expect(screen.getByTestId("protected-content")).toBeInTheDocument();
  });

  it.each(ROLES)(
    "redirects a %s user away from a dashboard that is not theirs, to their own dashboard",
    (authenticatedRole) => {
      useAuthStore.setState({ role: authenticatedRole });
      const mismatchedRole = ROLES.find((role) => role !== authenticatedRole) as Role;

      renderGuard(mismatchedRole);

      expect(replaceMock).toHaveBeenCalledTimes(1);
      expect(replaceMock).toHaveBeenCalledWith(
        ROLE_DEFINITIONS[authenticatedRole].dashboardPath,
      );
      expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    },
  );

  it("does not redirect or flash content while role state is null", () => {
    renderGuard("EVALUATION_MANAGER");

    expect(screen.queryByTestId("protected-content")).not.toBeInTheDocument();
    expect(replaceMock).toHaveBeenCalledWith("/");
  });
});
