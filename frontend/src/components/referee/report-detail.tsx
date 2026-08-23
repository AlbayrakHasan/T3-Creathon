import Link from "next/link";
import type { EvaluationReport } from "@/lib/mock-reports";
import { formatDate } from "@/lib/format";
import { StatusBadge } from "./status-badge";

interface ReportDetailProps {
  report: EvaluationReport | null;
}

export function ReportDetail({ report }: ReportDetailProps) {
  if (!report) {
    return (
      <div
        data-testid="report-detail-empty"
        className="flex h-full min-h-64 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border px-6 py-20 text-center"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-muted">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
              d="M9 12h6M9 16h6M9 8h6M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1Z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p className="text-sm font-semibold text-foreground">Select a report</p>
        <p className="max-w-xs text-xs text-muted">
          Choose a report from the list to review its submission details and evaluation
          status.
        </p>
      </div>
    );
  }

  return (
    <div
      data-testid="report-detail"
      className="rounded-2xl border border-border bg-surface p-6 shadow-sm"
    >
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            {report.reportId}
          </p>
          <h2 className="mt-1 text-xl font-bold text-foreground">{report.projectName}</h2>
        </div>
        <StatusBadge status={report.status} />
      </div>

      <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            Category
          </dt>
          <dd className="mt-1 text-sm text-foreground">{report.category}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            Submitted
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            {formatDate(report.submissionDate)}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted">
            Status
          </dt>
          <dd className="mt-1 text-sm text-foreground">
            {report.status === "pending"
              ? "Awaiting AI-assisted analysis"
              : "Analysis complete"}
          </dd>
        </div>
      </dl>

      <div className="mt-6 space-y-4">
        <section className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-bold text-foreground">AI-Assisted Score Summary</h3>
          <p className="mt-2 text-sm text-muted">
            {report.status === "analyzed"
              ? "Confidence scores, findings, and the AI 4th Eye suggestion are ready for review."
              : "This report is queued for AI-assisted analysis. Scoring will appear here once processing completes."}
          </p>
          <Link
            href={`/dashboard/referee/${report.reportId}`}
            data-testid="open-analysis-link"
            className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Open AI Analysis Report <span aria-hidden="true">→</span>
          </Link>
        </section>
        <section className="rounded-xl border border-border p-4">
          <h3 className="text-sm font-bold text-foreground">Referee Notes</h3>
          <p className="mt-2 text-sm text-muted">No notes added yet.</p>
        </section>
      </div>
    </div>
  );
}
