import type { ReportStatus } from "@/lib/mock-reports";

const STATUS_STYLES: Record<ReportStatus, string> = {
  pending: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200",
  analyzed: "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200",
};

const STATUS_LABELS: Record<ReportStatus, string> = {
  pending: "Beklemede",
  analyzed: "Analiz Edildi",
};

export function StatusBadge({ status }: { status: ReportStatus }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
