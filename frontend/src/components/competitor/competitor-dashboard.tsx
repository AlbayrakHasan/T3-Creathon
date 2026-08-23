import {
  COMPETITOR_OUTCOME_LABELS,
  getCompetitorSummary,
  type CompetitorEvaluationSummary,
} from "@/lib/competitor-feedback";
import type { DecisionOutcome } from "@/lib/final-decision";
import { formatDate } from "@/lib/format";
import { FeedbackSection } from "./feedback-section";

const OUTCOME_STYLES: Record<DecisionOutcome, string> = {
  approve: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  revise: "bg-amber-100 text-amber-800 ring-amber-200",
  reject: "bg-slate-100 text-slate-700 ring-border",
};

interface CompetitorDashboardProps {
  /** Provide directly in tests; defaults to the redacted mock summary. */
  summary?: CompetitorEvaluationSummary;
}

export function CompetitorDashboard({ summary }: CompetitorDashboardProps) {
  const evaluation = summary ?? getCompetitorSummary();

  return (
    <div className="flex flex-col gap-6" data-testid="competitor-dashboard">
      <section
        aria-labelledby="final-status-heading"
        data-testid="final-status"
        className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {evaluation.reportId} · {evaluation.category}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold text-foreground">
              {evaluation.projectName}
            </h1>
            <p
              data-testid="status-headline"
              className="mt-2 text-base font-semibold text-brand-700"
            >
              {evaluation.headline}
            </p>
          </div>

          <div className="flex flex-col items-end gap-2">
            <h2 id="final-status-heading" className="sr-only">
              Nihai Durum
            </h2>
            <span
              data-testid="outcome-badge"
              className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-bold ring-1 ring-inset ${OUTCOME_STYLES[evaluation.outcome]}`}
            >
              {COMPETITOR_OUTCOME_LABELS[evaluation.outcome]}
            </span>
            <p className="text-3xl font-extrabold tabular-nums text-foreground">
              {evaluation.finalScore}
              <span className="text-base font-bold text-muted">/100</span>
            </p>
            <p className="text-xs text-muted">Final puan</p>
          </div>
        </div>

        <dl className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              Gönderim Tarihi
            </dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">
              {formatDate(evaluation.submittedAt)}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
              İnceleme Tarihi
            </dt>
            <dd className="mt-1 text-sm font-semibold text-foreground">
              {formatDate(evaluation.reviewedAt)}
            </dd>
          </div>
        </dl>
      </section>

      <FeedbackSection
        variant="strength"
        title="Güçlü Yönler"
        intro="Değerlendirme kurulunun başvurunuzda en ikna edici bulduğu noktalar."
        points={evaluation.strengths}
        testId="strengths-section"
      />

      <FeedbackSection
        variant="improvement"
        title="Geliştirilmesi Gereken Alanlar"
        intro="Bir sonraki başvurunuza taşıyabileceğiniz somut, uygulanabilir notlar."
        points={evaluation.improvements}
        testId="improvements-section"
      />

      <section
        aria-labelledby="next-step-heading"
        data-testid="next-step-section"
        className="rounded-2xl border border-brand-100 bg-brand-50/70 p-6"
      >
        <h2 id="next-step-heading" className="text-base font-bold text-brand-900">
          Sırada Ne Var
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-brand-900/80">
          {evaluation.nextStep}
        </p>
      </section>
    </div>
  );
}
