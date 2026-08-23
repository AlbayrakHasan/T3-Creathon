import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CriteriaTemplateForm } from "./criteria-template-form";

async function fillWeight(user: ReturnType<typeof userEvent.setup>, index: number, value: string) {
  const weightInput = screen.getByLabelText(new RegExp(`Metric ${index + 1} weight`, "i"));
  await user.clear(weightInput);
  if (value) await user.type(weightInput, value);
}

describe("CriteriaTemplateForm", () => {
  it("renders the template name, category, and at least one metric and heading row", () => {
    render(<CriteriaTemplateForm />);

    expect(screen.getByLabelText(/template name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^category$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/metric 1 name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^required heading 1$/i)).toBeInTheDocument();
  });

  it("shows validation errors when submitting an empty form", async () => {
    const user = userEvent.setup();
    render(<CriteriaTemplateForm />);

    await user.click(screen.getByRole("button", { name: /save template/i }));

    expect(
      await screen.findByText(/template name must be at least 3 characters/i),
    ).toBeInTheDocument();
    expect(document.getElementById("category-error")).toHaveTextContent(/select a category/i);
    expect(screen.getByText(/metric name must be at least 2 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/heading must be at least 2 characters/i)).toBeInTheDocument();
  });

  it("rejects a template name shorter than 3 characters", async () => {
    const user = userEvent.setup();
    render(<CriteriaTemplateForm />);

    await user.type(screen.getByLabelText(/template name/i), "AI");
    await user.click(screen.getByRole("button", { name: /save template/i }));

    expect(
      await screen.findByText(/template name must be at least 3 characters/i),
    ).toBeInTheDocument();
  });

  it("flags metric weights that don't add up to 100%", async () => {
    const user = userEvent.setup();
    render(<CriteriaTemplateForm />);

    await user.type(screen.getByLabelText(/template name/i), "Robotics Final Round");
    await user.selectOptions(screen.getByLabelText(/^category$/i), "Robotics & Automation");
    await user.type(screen.getByLabelText(/metric 1 name/i), "Technical feasibility");
    await fillWeight(user, 0, "40");
    await user.type(screen.getByLabelText(/^required heading 1$/i), "Abstract");

    await user.click(screen.getByRole("button", { name: /save template/i }));

    expect(
      await screen.findByText(/metric weights must add up to 100%.*currently 40%/i),
    ).toBeInTheDocument();
  });

  it("adds and removes metric rows, disabling remove when only one remains", async () => {
    const user = userEvent.setup();
    render(<CriteriaTemplateForm />);

    expect(screen.getByLabelText(/remove metric 1/i)).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /add metric/i }));
    expect(screen.getByLabelText(/metric 2 name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/remove metric 1/i)).not.toBeDisabled();

    await user.click(screen.getByLabelText(/remove metric 2/i));
    expect(screen.queryByLabelText(/metric 2 name/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/remove metric 1/i)).toBeDisabled();
  });

  it("submits successfully with valid data, shows a success banner, and resets the form", async () => {
    const user = userEvent.setup();
    const onSaved = jest.fn();
    render(<CriteriaTemplateForm onSaved={onSaved} />);

    await user.type(screen.getByLabelText(/template name/i), "Robotics Final Round");
    await user.selectOptions(screen.getByLabelText(/^category$/i), "Robotics & Automation");
    await user.type(screen.getByLabelText(/metric 1 name/i), "Technical feasibility");
    await fillWeight(user, 0, "100");
    await user.type(screen.getByLabelText(/^required heading 1$/i), "Abstract");

    await user.click(screen.getByRole("button", { name: /save template/i }));

    const banner = await screen.findByTestId("template-saved-banner");
    expect(within(banner).getByText(/robotics final round/i)).toBeInTheDocument();

    expect(onSaved).toHaveBeenCalledTimes(1);
    expect(onSaved).toHaveBeenCalledWith(
      expect.objectContaining({
        templateName: "Robotics Final Round",
        category: "Robotics & Automation",
        metrics: [{ name: "Technical feasibility", weight: 100 }],
        requiredHeadings: [{ value: "Abstract" }],
      }),
    );

    expect(screen.getByLabelText(/template name/i)).toHaveValue("");
    expect(screen.getByLabelText(/metric 1 name/i)).toHaveValue("");
  });

  it("dismisses the success banner when the close button is clicked", async () => {
    const user = userEvent.setup();
    render(<CriteriaTemplateForm />);

    await user.type(screen.getByLabelText(/template name/i), "Robotics Final Round");
    await user.selectOptions(screen.getByLabelText(/^category$/i), "Robotics & Automation");
    await user.type(screen.getByLabelText(/metric 1 name/i), "Technical feasibility");
    await fillWeight(user, 0, "100");
    await user.type(screen.getByLabelText(/^required heading 1$/i), "Abstract");
    await user.click(screen.getByRole("button", { name: /save template/i }));

    const banner = await screen.findByTestId("template-saved-banner");
    await user.click(within(banner).getByRole("button", { name: /dismiss/i }));

    expect(screen.queryByTestId("template-saved-banner")).not.toBeInTheDocument();
  });
});
