export function ReportListSkeleton() {
  return (
    <ul
      data-testid="report-list-skeleton"
      aria-hidden="true"
      className="divide-y divide-border"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <li key={index} className="flex flex-col gap-2 px-4 py-4">
          <div className="h-3.5 w-3/4 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-1/2 animate-pulse rounded bg-slate-200" />
          <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
        </li>
      ))}
    </ul>
  );
}
