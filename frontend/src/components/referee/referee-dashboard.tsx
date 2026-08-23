"use client";

import { useEffect, useState } from "react";
import { getMockReports, type EvaluationReport } from "@/lib/mock-reports";
import { ReportList } from "./report-list";
import { ReportListSkeleton } from "./report-list-skeleton";
import { ReportDetail } from "./report-detail";

interface RefereeDashboardProps {
  /** Provide directly (e.g. in tests) to skip the simulated network fetch. */
  initialReports?: EvaluationReport[];
  /** Simulated fetch latency in ms; only used when `initialReports` is omitted. */
  loadingDelayMs?: number;
}

export function RefereeDashboard({
  initialReports,
  loadingDelayMs = 350,
}: RefereeDashboardProps) {
  const [reports, setReports] = useState<EvaluationReport[] | null>(
    initialReports ?? null,
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    if (initialReports) return;
    const timer = setTimeout(() => setReports(getMockReports()), loadingDelayMs);
    return () => clearTimeout(timer);
  }, [initialReports, loadingDelayMs]);

  const selectedReport =
    reports?.find((report) => report.reportId === selectedId) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Evaluation Reports</h2>
        <p className="mt-1 text-sm text-muted">
          Review submitted projects and track AI-assisted evaluation status.
        </p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <aside className="w-full overflow-hidden rounded-2xl border border-border bg-surface shadow-sm lg:w-96 lg:shrink-0">
          <div className="border-b border-border px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              {reports
                ? `${reports.length} report${reports.length === 1 ? "" : "s"}`
                : "Loading reports"}
            </p>
          </div>
          {reports === null ? (
            <ReportListSkeleton />
          ) : (
            <ReportList reports={reports} selectedId={selectedId} onSelect={setSelectedId} />
          )}
        </aside>

        <div className="min-w-0 flex-1">
          {reports === null ? (
            <div
              data-testid="report-detail-skeleton"
              aria-hidden="true"
              className="h-64 animate-pulse rounded-2xl border border-border bg-slate-100"
            />
          ) : (
            <ReportDetail report={selectedReport} />
          )}
        </div>
      </div>
    </div>
  );
}
