import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FinalDecisionForm } from "./final-decision-form";
import { getMockAnalysis } from "@/lib/ai-analysis";
import type { AiSuggestion } from "@/lib/ai-analysis";

const REPORT_ID = "RPT-2026-013";

const suggestion: AiSuggestion = getMockAnalysis(REPORT_ID)!.suggestion;

const JUSTIFICATION =
  "Manually re-read the methodology section; the limitations gap is more serious than the engine judged.";

function renderForm(onSubmitDecision = jest.fn()) {
  const user = userEvent.setup();
  render(
    <FinalDecisionForm
      reportId={REPORT_ID}
      suggestion={suggestion}
      onSubmitDecision={onSubmitDecision}
    />,
  );
  return { user, onSubmitDecision };
}

function scoreInput() {
  return screen.getByLabelText(/final score/i) as HTMLInputElement;
}

describe("FinalDecisionForm", () => {
  it("distinguishes the AI suggestion from the referee's own input", () => {
    renderForm();

    const panel = screen.getByTestId("ai-suggestion-panel");
    expect(panel).toHaveTextContent(/ai 4th eye/i);
    expect(panel).toHaveTextContent(/advisory/i);
    expect(screen.getByTestId("ai-suggested-score")).toHaveTextContent("88");
    expect(screen.getByTestId("ai-suggested-outcome")).toHaveTextContent("Approve");

    // The AI's numbers live outside the form; the form holds the referee's entry.
    const form = screen.getByTestId("final-decision-form");
    expect(form).toHaveTextContent(/referee final input/i);
    expect(form).not.toContainElement(panel);
  });

  it("pre-fills the referee inputs with the AI suggestion and marks them as matching", () => {
    renderForm();

    expect(scoreInput()).toHaveValue(suggestion.score);
    expect(screen.getByRole("radio", { name: /approve/i })).toBeChecked();
    expect(screen.getByTestId("agreement-indicator")).toBeInTheDocument();
    expect(screen.queryByTestId("override-indicator")).not.toBeInTheDocument();
    expect(screen.getByTestId("ai-choice-marker-approve")).toBeInTheDocument();
  });

  it("lets the referee overwrite the AI suggestion and submits the manual values", async () => {
    const { user, onSubmitDecision } = renderForm();

    await user.clear(scoreInput());
    await user.type(scoreInput(), "57");
    await user.click(screen.getByRole("radio", { name: /request revision/i }));
    await user.type(screen.getByLabelText(/justification/i), JUSTIFICATION);

    expect(screen.getByTestId("override-indicator")).toHaveTextContent(/overriding ai/i);

    await user.click(screen.getByRole("button", { name: /submit final decision/i }));

    await waitFor(() => expect(onSubmitDecision).toHaveBeenCalledTimes(1));
    expect(onSubmitDecision).toHaveBeenCalledWith({
      reportId: REPORT_ID,
      finalScore: 57,
      outcome: "revise",
      refereeNotes: JUSTIFICATION,
      overridesAiSuggestion: true,
    });
  });

  it("records agreement when the referee accepts the AI suggestion unchanged", async () => {
    const { user, onSubmitDecision } = renderForm();

    await user.type(screen.getByLabelText(/justification/i), JUSTIFICATION);
    await user.click(screen.getByRole("button", { name: /submit final decision/i }));

    await waitFor(() => expect(onSubmitDecision).toHaveBeenCalledTimes(1));
    expect(onSubmitDecision).toHaveBeenCalledWith(
      expect.objectContaining({
        finalScore: suggestion.score,
        outcome: suggestion.outcome,
        overridesAiSuggestion: false,
      }),
    );
  });

  it("flags an override when only the outcome differs from the AI suggestion", async () => {
    const { user, onSubmitDecision } = renderForm();

    await user.click(screen.getByRole("radio", { name: /reject/i }));
    await user.type(screen.getByLabelText(/justification/i), JUSTIFICATION);
    await user.click(screen.getByRole("button", { name: /submit final decision/i }));

    await waitFor(() => expect(onSubmitDecision).toHaveBeenCalledTimes(1));
    expect(onSubmitDecision).toHaveBeenCalledWith(
      expect.objectContaining({
        finalScore: suggestion.score,
        outcome: "reject",
        overridesAiSuggestion: true,
      }),
    );
  });

  it("confirms the recorded decision and notes that the AI was overridden", async () => {
    const { user } = renderForm();

    await user.clear(scoreInput());
    await user.type(scoreInput(), "57");
    await user.type(screen.getByLabelText(/justification/i), JUSTIFICATION);
    await user.click(screen.getByRole("button", { name: /submit final decision/i }));

    const banner = await screen.findByTestId("decision-saved-banner");
    expect(banner).toHaveTextContent(REPORT_ID);
    expect(banner).toHaveTextContent("57/100");
    expect(banner).toHaveTextContent(/ai suggestion overridden/i);
  });

  it("restores the AI suggestion on reset while keeping the referee's justification", async () => {
    const { user } = renderForm();

    await user.clear(scoreInput());
    await user.type(scoreInput(), "20");
    await user.click(screen.getByRole("radio", { name: /reject/i }));
    await user.type(screen.getByLabelText(/justification/i), JUSTIFICATION);
    expect(screen.getByTestId("override-indicator")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /reset to ai suggestion/i }));

    expect(scoreInput()).toHaveValue(suggestion.score);
    expect(screen.getByRole("radio", { name: /approve/i })).toBeChecked();
    expect(screen.getByTestId("agreement-indicator")).toBeInTheDocument();
    expect(screen.getByLabelText(/justification/i)).toHaveValue(JUSTIFICATION);
  });

  it("blocks submission and does not call the submit handler when the score is out of range", async () => {
    const { user, onSubmitDecision } = renderForm();

    await user.clear(scoreInput());
    await user.type(scoreInput(), "140");
    await user.type(screen.getByLabelText(/justification/i), JUSTIFICATION);
    await user.click(screen.getByRole("button", { name: /submit final decision/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/cannot exceed 100/i);
    expect(onSubmitDecision).not.toHaveBeenCalled();
  });

  it("blocks submission and does not call the submit handler when the score is blank", async () => {
    const { user, onSubmitDecision } = renderForm();

    await user.clear(scoreInput());
    await user.type(screen.getByLabelText(/justification/i), JUSTIFICATION);
    await user.click(screen.getByRole("button", { name: /submit final decision/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/final score/i);
    expect(onSubmitDecision).not.toHaveBeenCalled();
  });

  it("requires a written justification before recording the decision", async () => {
    const { user, onSubmitDecision } = renderForm();

    await user.type(screen.getByLabelText(/justification/i), "Too short");
    await user.click(screen.getByRole("button", { name: /submit final decision/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 20 characters/i);
    expect(onSubmitDecision).not.toHaveBeenCalled();
    expect(screen.queryByTestId("decision-saved-banner")).not.toBeInTheDocument();
  });

  it("still records the decision when no submit handler is wired up", async () => {
    const user = userEvent.setup();
    render(<FinalDecisionForm reportId={REPORT_ID} suggestion={suggestion} />);

    await user.type(screen.getByLabelText(/justification/i), JUSTIFICATION);
    await user.click(screen.getByRole("button", { name: /submit final decision/i }));

    expect(await screen.findByTestId("decision-saved-banner")).toBeInTheDocument();
  });
});
