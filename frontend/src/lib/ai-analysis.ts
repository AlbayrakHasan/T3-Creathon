import type { DecisionOutcome } from "./final-decision";

export const CHECK_KEYS = [
  "languageTemplate",
  "contentHeading",
  "categoryMatch",
  "similarity",
] as const;

export type AiCheckKey = (typeof CHECK_KEYS)[number];

/**
 * `positive` — a higher score is a better result (e.g. template match).
 * `negative` — a lower score is a better result (e.g. plagiarism similarity).
 */
export type CheckPolarity = "positive" | "negative";

export type CheckTone = "positive" | "caution" | "critical";

export interface AiCheckDefinition {
  key: AiCheckKey;
  label: string;
  /** Compact label used inside the confidence ring cards. */
  shortLabel: string;
  description: string;
  polarity: CheckPolarity;
}

export const CHECK_DEFINITIONS: Record<AiCheckKey, AiCheckDefinition> = {
  languageTemplate: {
    key: "languageTemplate",
    label: "Language / Template Match",
    shortLabel: "Language & Template",
    description:
      "How closely the submission follows the required report template, tone, and language rules.",
    polarity: "positive",
  },
  contentHeading: {
    key: "contentHeading",
    label: "Content / Heading Check",
    shortLabel: "Content & Headings",
    description:
      "Whether every mandatory heading is present and carries substantive content beneath it.",
    polarity: "positive",
  },
  categoryMatch: {
    key: "categoryMatch",
    label: "Category Match",
    shortLabel: "Category Match",
    description:
      "How well the project's subject matter aligns with the category it was submitted under.",
    polarity: "positive",
  },
  similarity: {
    key: "similarity",
    label: "Similarity / Plagiarism",
    shortLabel: "Similarity",
    description:
      "Overlap detected against prior submissions and public sources. Lower is better.",
    polarity: "negative",
  },
};

export interface AiCheckResult {
  /** Confidence score from the evaluation engine, 0–100. */
  score: number;
  summary: string;
  findings: string[];
}

export type AiCheck = AiCheckDefinition & AiCheckResult;

export interface AiSuggestion {
  score: number;
  outcome: DecisionOutcome;
  rationale: string;
}

export interface AiAnalysis {
  reportId: string;
  analyzedAt: string;
  engineVersion: string;
  results: Record<AiCheckKey, AiCheckResult>;
  suggestion: AiSuggestion;
}

const POSITIVE_TONE_FLOOR = 85;
const CAUTION_TONE_FLOOR = 65;
const NEGATIVE_TONE_CEILING = 15;
const NEGATIVE_CAUTION_CEILING = 35;

/** Maps a raw score to a tone, respecting the check's polarity. */
export function getCheckTone(score: number, polarity: CheckPolarity): CheckTone {
  if (polarity === "negative") {
    if (score <= NEGATIVE_TONE_CEILING) return "positive";
    if (score <= NEGATIVE_CAUTION_CEILING) return "caution";
    return "critical";
  }
  if (score >= POSITIVE_TONE_FLOOR) return "positive";
  if (score >= CAUTION_TONE_FLOOR) return "caution";
  return "critical";
}

const TONE_LABELS: Record<CheckPolarity, Record<CheckTone, string>> = {
  positive: {
    positive: "High confidence",
    caution: "Needs review",
    critical: "Low confidence",
  },
  negative: {
    positive: "Original",
    caution: "Needs review",
    critical: "High risk",
  },
};

export function getToneLabel(score: number, polarity: CheckPolarity): string {
  return TONE_LABELS[polarity][getCheckTone(score, polarity)];
}

/** Expands a stored analysis into the ordered, display-ready list of checks. */
export function getChecks(analysis: AiAnalysis): AiCheck[] {
  return CHECK_KEYS.map((key) => ({
    ...CHECK_DEFINITIONS[key],
    ...analysis.results[key],
  }));
}

/**
 * Confidence the engine has in its own overall suggestion: the mean of every
 * check, with the negative-polarity checks flipped so 100 always means "good".
 */
export function getOverallConfidence(analysis: AiAnalysis): number {
  const total = CHECK_KEYS.reduce((sum, key) => {
    const { score } = analysis.results[key];
    const normalized =
      CHECK_DEFINITIONS[key].polarity === "negative" ? 100 - score : score;
    return sum + normalized;
  }, 0);
  return Math.round(total / CHECK_KEYS.length);
}

export const MOCK_ANALYSES: Record<string, AiAnalysis> = {
  "RPT-2026-013": {
    reportId: "RPT-2026-013",
    analyzedAt: "2026-08-17",
    engineVersion: "eval-engine v2.4",
    results: {
      languageTemplate: {
        score: 94,
        summary: "Follows the official template with consistent academic register.",
        findings: [
          "All 6 template sections present in the required order.",
          "Citation style matches the competition handbook (IEEE).",
          "Two figure captions are missing numbering.",
        ],
      },
      contentHeading: {
        score: 88,
        summary: "Every mandatory heading is present and substantively filled in.",
        findings: [
          "Abstract, Methodology, Results, and Discussion all exceed the minimum length.",
          "“Limitations” section is present but under 100 words.",
        ],
      },
      categoryMatch: {
        score: 91,
        summary: "Strongly aligned with the AI & Machine Learning category.",
        findings: [
          "Core contribution is a transformer-based gesture recognition model.",
          "Hardware discussion is secondary and does not shift the category.",
        ],
      },
      similarity: {
        score: 8,
        summary: "No meaningful overlap with prior submissions or public sources.",
        findings: [
          "Highest single-source overlap is 3% and limited to standard definitions.",
          "No matches against the 2025 submission corpus.",
        ],
      },
    },
    suggestion: {
      score: 88,
      outcome: "approve",
      rationale:
        "Template compliance and originality are both strong. The only soft spot is a thin Limitations section, which does not warrant a revision cycle.",
    },
  },
  "RPT-2026-011": {
    reportId: "RPT-2026-011",
    analyzedAt: "2026-08-15",
    engineVersion: "eval-engine v2.4",
    results: {
      languageTemplate: {
        score: 72,
        summary: "Template broadly followed, but formatting drifts in later sections.",
        findings: [
          "Appendix uses an unapproved two-column layout.",
          "Mixed citation styles between sections 3 and 5.",
          "Tone shifts to marketing language in the Conclusion.",
        ],
      },
      contentHeading: {
        score: 61,
        summary: "Two mandatory headings are missing from the submission.",
        findings: [
          "“Risk Assessment” heading not found.",
          "“Data Sources” heading not found.",
          "Results section contains content that belongs under Discussion.",
        ],
      },
      categoryMatch: {
        score: 86,
        summary: "Fits the FinTech category, with some regulatory-policy overlap.",
        findings: [
          "Micro-lending mechanics are the primary contribution.",
          "A third of the report addresses compliance rather than technology.",
        ],
      },
      similarity: {
        score: 28,
        summary: "Moderate overlap traced to the team's own earlier white paper.",
        findings: [
          "22% overlap with a publicly published white paper by the same authors.",
          "6% overlap with standard regulatory boilerplate.",
        ],
      },
    },
    suggestion: {
      score: 64,
      outcome: "revise",
      rationale:
        "Two mandatory headings are absent and self-overlap is above the comfort threshold. A revision cycle should resolve both without penalising a solid concept.",
    },
  },
  "RPT-2026-009": {
    reportId: "RPT-2026-009",
    analyzedAt: "2026-08-12",
    engineVersion: "eval-engine v2.4",
    results: {
      languageTemplate: {
        score: 58,
        summary: "Substantial deviation from the required template structure.",
        findings: [
          "Report submitted as a design document rather than the evaluation template.",
          "No abstract present.",
          "Section numbering does not match the handbook.",
        ],
      },
      contentHeading: {
        score: 49,
        summary: "Fewer than half of the mandatory headings could be located.",
        findings: [
          "Only “Introduction” and “Results” matched the required set.",
          "Methodology content is distributed across unlabelled prose.",
        ],
      },
      categoryMatch: {
        score: 93,
        summary: "Unambiguously a Game Design submission.",
        findings: [
          "Procedural generation and level pacing are the central topics.",
          "No content suggesting a different category.",
        ],
      },
      similarity: {
        score: 47,
        summary: "High overlap with a widely circulated tutorial series.",
        findings: [
          "38% overlap with a public procedural-generation tutorial.",
          "9% overlap with a 2025 submission from a different team.",
        ],
      },
    },
    suggestion: {
      score: 41,
      outcome: "reject",
      rationale:
        "Similarity is far above threshold and the template was not used. Category fit alone is not sufficient to advance the submission.",
    },
  },
};

export function getMockAnalysis(reportId: string): AiAnalysis | null {
  return MOCK_ANALYSES[reportId] ?? null;
}
