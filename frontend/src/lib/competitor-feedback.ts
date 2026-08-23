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
  approve: "İlerledi",
  revise: "Revizyon İstendi",
  reject: "İlerlemedi",
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
  category: "Yapay Zeka ve Makine Öğrenmesi",
  submittedAt: "2026-08-17",
  reviewedAt: "2026-08-19",
  outcome: "approve",
  finalScore: 86,

  refereeName: "Dr. Elif Karaca",
  refereeNotes:
    "Dahili not: motorun şablon uyumu değerlendirmesine katıldım; zayıf Kısıtlamalar bölümü nedeniyle iki puan kırdım.",
  aiSuggestedScore: 88,
  aiSuggestedOutcome: "approve",
  similarityScore: 8,

  message: {
    headline: "Başvurunuz final turuna yükseldi.",
    strengths: [
      {
        title: "Açık ve iyi yapılandırılmış raporlama",
        detail:
          "Raporunuz yarışma şablonunu yakından takip etti ve tüm zorunlu bölümler kolayca bulunabildi. Değerlendiriciler yöntem bölümünüzü ne kadar hızlı bulabildiklerini özellikle belirtti.",
      },
      {
        title: "Özgün ve iyi kaynak gösterilmiş çalışma",
        detail:
          "Özgünlük kontrolleri temiz çıktı. Kaynaklarınız doğru şekilde belirtilmiş ve katkı gerçekten size ait görünüyor.",
      },
      {
        title: "Kategorinize güçlü uyum",
        detail:
          "Hareket tanıma modeli tam olarak Yapay Zeka ve Makine Öğrenmesi kategorisine giriyor ve probleminizi ele alış biçiminiz bu uyumu değerlendiricilere açıkça gösterdi.",
      },
    ],
    improvements: [
      {
        title: "Kısıtlamalar bölümünü genişletin",
        detail:
          "Bu bölüm mevcuttu ancak kısaydı. Modelinizin daha düşük performans gösterdiği koşulları (düşük ışık, tanımadığı işaretleyiciler gibi) belirtmek çalışmanızı önemli ölçüde güçlendirecektir.",
      },
      {
        title: "Şekil altyazılarını numaralandırın",
        detail:
          "Metinde iki şekle, eşleşen altyazı numaraları olmadan atıfta bulunulmuş; bu da takip etmeyi zorlaştırdı.",
      },
    ],
    nextStep:
      "Şu anda sizden herhangi bir işlem yapmanız beklenmiyor. Jüri panelleri onaylandığında final takvimi bu panel üzerinden paylaşılacaktır.",
  },
};

export function getCompetitorSummary(): CompetitorEvaluationSummary {
  return toCompetitorSummary(MOCK_PUBLISHED_EVALUATION);
}
