import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RefereeDashboard } from "./referee-dashboard";
import { MOCK_REPORTS } from "@/lib/mock-reports";

describe("RefereeDashboard", () => {
  it("renders the mock list of evaluation reports", () => {
    render(<RefereeDashboard initialReports={MOCK_REPORTS} />);

    const list = screen.getByRole("listbox", { name: /evaluation reports/i });
    const options = within(list).getAllByRole("option");
    expect(options).toHaveLength(MOCK_REPORTS.length);

    for (const report of MOCK_REPORTS) {
      const row = screen.getByTestId(`report-row-${report.reportId}`);
      expect(row).toHaveTextContent(report.projectName);
      expect(row).toHaveTextContent(report.category);
    }
  });

  it("shows an empty state in the detail pane before any report is selected", () => {
    render(<RefereeDashboard initialReports={MOCK_REPORTS} />);

    expect(screen.getByTestId("report-detail-empty")).toBeInTheDocument();
    expect(screen.queryByTestId("report-detail")).not.toBeInTheDocument();
  });

  it("shows an empty state in the sidebar when there are no reports", () => {
    render(<RefereeDashboard initialReports={[]} />);

    expect(screen.getByTestId("report-list-empty")).toHaveTextContent(/no reports yet/i);
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });

  it("shows loading skeletons before the simulated fetch resolves, then renders the list", async () => {
    render(<RefereeDashboard loadingDelayMs={10} />);

    expect(screen.getByTestId("report-list-skeleton")).toBeInTheDocument();
    expect(screen.getByTestId("report-detail-skeleton")).toBeInTheDocument();
    expect(screen.queryByRole("listbox", { name: /evaluation reports/i })).not.toBeInTheDocument();

    const list = await screen.findByRole("listbox", { name: /evaluation reports/i });
    expect(within(list).getAllByRole("option").length).toBeGreaterThan(0);
    expect(screen.queryByTestId("report-list-skeleton")).not.toBeInTheDocument();
  });

  it("updates the detail view to show the selected report when a row is clicked", async () => {
    const user = userEvent.setup();
    render(<RefereeDashboard initialReports={MOCK_REPORTS} />);

    const target = MOCK_REPORTS[2];
    await user.click(screen.getByTestId(`report-row-${target.reportId}`));

    expect(screen.queryByTestId("report-detail-empty")).not.toBeInTheDocument();
    const detail = screen.getByTestId("report-detail");
    expect(detail).toHaveTextContent(target.projectName);
    expect(detail).toHaveTextContent(target.reportId);
    expect(detail).toHaveTextContent(target.category);
  });

  it("marks the selected row as aria-selected and updates when selection changes", async () => {
    const user = userEvent.setup();
    render(<RefereeDashboard initialReports={MOCK_REPORTS} />);

    const first = MOCK_REPORTS[0];
    const second = MOCK_REPORTS[1];

    await user.click(screen.getByTestId(`report-row-${first.reportId}`));
    expect(screen.getByTestId(`report-row-${first.reportId}`)).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByTestId("report-detail")).toHaveTextContent(first.projectName);

    await user.click(screen.getByTestId(`report-row-${second.reportId}`));
    expect(screen.getByTestId(`report-row-${first.reportId}`)).toHaveAttribute(
      "aria-selected",
      "false",
    );
    expect(screen.getByTestId(`report-row-${second.reportId}`)).toHaveAttribute(
      "aria-selected",
      "true",
    );

    const detail = screen.getByTestId("report-detail");
    expect(detail).toHaveTextContent(second.projectName);
    expect(detail).not.toHaveTextContent(first.projectName);
  });

  it("supports selecting a report via the keyboard", async () => {
    const user = userEvent.setup();
    render(<RefereeDashboard initialReports={MOCK_REPORTS} />);

    const target = MOCK_REPORTS[3];
    const row = screen.getByTestId(`report-row-${target.reportId}`);
    row.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByTestId("report-detail")).toHaveTextContent(target.projectName);
  });
});
