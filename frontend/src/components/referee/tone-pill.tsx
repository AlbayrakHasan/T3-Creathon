import type { CheckTone } from "@/lib/ai-analysis";

const TONE_STYLES: Record<CheckTone, string> = {
  positive: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  caution: "bg-amber-50 text-amber-700 ring-amber-200",
  critical: "bg-rose-50 text-rose-700 ring-rose-200",
};

interface TonePillProps {
  tone: CheckTone;
  children: React.ReactNode;
  testId?: string;
}

export function TonePill({ tone, children, testId }: TonePillProps) {
  return (
    <span
      data-testid={testId}
      data-tone={tone}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${TONE_STYLES[tone]}`}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
