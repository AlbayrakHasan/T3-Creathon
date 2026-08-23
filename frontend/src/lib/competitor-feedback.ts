import type { DecisionOutcome } from "./final-decision";

export interface FeedbackPoint {
  title: string;
  detail: string;
}

/**
 * Competitor-facing wording for a decision. Deliberately gentler than the
 * referee-side {@link import("./final-decision").DECISION_LABELS}.
 */
export const COMPETITOR_OUTCOME_LABELS: Record<DecisionOutcome, string> = {
  approve: "Advanced",
  revise: "Revision Requested",
  reject: "Not Advancing",
};

/**
 * The full record kept once a referee submits a decision. It carries
 * referee-only fields and must never be handed to a competitor directly —
 * use {@link toCompetitorSummary} to project the shareable subset.
 */
export interface PublishedEvaluation {
  reportId: string;
  projectName: string;
  category: string;
  submittedAt: string;
  reviewedAt: string;
  outcome: DecisionOutcome;
  finalScore: number;

  /** Referee-only fields below — deliberately excluded from the competitor view. */
  refereeName: string;
  refereeNotes: string;
  aiSuggestedScore: number;
  aiSuggestedOutcome: DecisionOutcome;
  similarityScore: number;

  /** The curated, competitor-facing narrative written alongside the decision. */
  message: {
    headline: string;
    strengths: FeedbackPoint[];
    improvements: FeedbackPoint[];
    nextStep: string;
  };
}

/** Exactly what a `COMPETITOR` is allowed to see about their own submission. */
export interface CompetitorEvaluationSummary {
  reportId: string;
  projectName: string;
  category: string;
  submittedAt: string;
  reviewedAt: string;
  outcome: DecisionOutcome;
  finalScore: number;
  headline: string;
  strengths: FeedbackPoint[];
  improvements: FeedbackPoint[];
  nextStep: string;
}

/**
 * Whitelisting projection: every competitor-visible field is named explicitly,
 * so a new referee-only field on {@link PublishedEvaluation} can never leak by
 * being spread into the competitor payload.
 */
export function toCompetitorSummary(
  evaluation: PublishedEvaluation,
): CompetitorEvaluationSummary {
  return {
    reportId: evaluation.reportId,
    projectName: evaluation.projectName,
    category: evaluation.category,
    submittedAt: evaluation.submittedAt,
    reviewedAt: evaluation.reviewedAt,
    outcome: evaluation.outcome,
    finalScore: evaluation.finalScore,
    headline: evaluation.message.headline,
    strengths: evaluation.message.strengths,
    improvements: evaluation.message.improvements,
    nextStep: evaluation.message.nextStep,
  };
}

export const MOCK_PUBLISHED_EVALUATION: PublishedEvaluation = {
  reportId: "RPT-2026-013",
  projectName: "NeuroLingua — Real-Time Sign Language Translator",
  category: "AI & Machine Learning",
  submittedAt: "2026-08-17",
  reviewedAt: "2026-08-19",
  outcome: "approve",
  finalScore: 86,

  refereeName: "Dr. Elif Karaca",
  refereeNotes:
    "Internal: agreed with the engine on template compliance; docked two points for the thin Limitations section.",
  aiSuggestedScore: 88,
  aiSuggestedOutcome: "approve",
  similarityScore: 8,

  message: {
    headline: "Your submission advances to the final round.",
    strengths: [
      {
        title: "Clear, well-structured reporting",
        detail:
          "Your report followed the competition template closely and every required section was easy to locate. Reviewers highlighted how quickly they could find your methodology.",
      },
      {
        title: "Original, well-cited work",
        detail:
          "Originality checks came back clean. Your sources were properly attributed and the contribution reads as genuinely your own.",
      },
      {
        title: "Strong fit for your category",
        detail:
          "The gesture-recognition model sits squarely in AI & Machine Learning, and your framing of the problem made that fit obvious to reviewers.",
      },
    ],
    improvements: [
      {
        title: "Expand the Limitations section",
        detail:
          "This section was present but brief. Naming the conditions where your model underperforms — low light, unfamiliar signers — would strengthen the work considerably.",
      },
      {
        title: "Number your figure captions",
        detail:
          "Two figures were referenced in the text without matching caption numbers, which made them harder to follow.",
      },
    ],
    nextStep:
      "No action is required from you right now. The finals schedule will be shared through this dashboard once judging panels are confirmed.",
  },
};

export function getCompetitorSummary(): CompetitorEvaluationSummary {
  return toCompetitorSummary(MOCK_PUBLISHED_EVALUATION);
}
