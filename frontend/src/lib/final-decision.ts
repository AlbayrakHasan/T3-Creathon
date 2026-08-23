import { z } from "zod";

export const DECISION_OUTCOMES = ["approve", "revise", "reject"] as const;

export type DecisionOutcome = (typeof DECISION_OUTCOMES)[number];

export const DECISION_LABELS: Record<DecisionOutcome, string> = {
  approve: "Approve",
  revise: "Request Revision",
  reject: "Reject",
};

export const DECISION_DESCRIPTIONS: Record<DecisionOutcome, string> = {
  approve: "Report meets the rubric and advances to the next round.",
  revise: "Report is promising but must be resubmitted with corrections.",
  reject: "Report does not satisfy the competition criteria.",
};

export const finalDecisionSchema = z.object({
  finalScore: z
    .number({ error: "Enter a final score between 0 and 100" })
    .min(0, "Final score cannot be below 0")
    .max(100, "Final score cannot exceed 100"),
  outcome: z.enum(DECISION_OUTCOMES, { error: "Select a final decision" }),
  refereeNotes: z
    .string()
    .trim()
    .min(20, "Add at least 20 characters of justification")
    .max(1000, "Justification must be 1000 characters or fewer"),
});

/** Raw form field shape, as registered on the inputs. */
export type FinalDecisionFormInput = z.input<typeof finalDecisionSchema>;
/** Parsed shape produced on successful submit. */
export type FinalDecisionFormValues = z.output<typeof finalDecisionSchema>;

/** What the referee's final decision form hands to its `onSubmit` callback. */
export interface FinalDecisionSubmission extends FinalDecisionFormValues {
  reportId: string;
  /** True when the referee changed the score or outcome the AI 4th Eye proposed. */
  overridesAiSuggestion: boolean;
}
