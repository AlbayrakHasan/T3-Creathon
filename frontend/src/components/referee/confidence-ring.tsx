import type { CheckTone } from "@/lib/ai-analysis";

const RADIUS = 32;
const STROKE = 6;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const VIEWBOX = (RADIUS + STROKE) * 2;

const TONE_STROKE: Record<CheckTone, string> = {
  positive: "text-emerald-500",
  caution: "text-amber-500",
  critical: "text-rose-500",
};

const TONE_TEXT: Record<CheckTone, string> = {
  positive: "text-emerald-700",
  caution: "text-amber-700",
  critical: "text-rose-700",
};

interface ConfidenceRingProps {
  /** Accessible name for the meter, e.g. "Dil / Şablon Uyumu". */
  label: string;
  /** 0–100. Drives both the arc length and the centred readout. */
  value: number;
  tone: CheckTone;
}

export function ConfidenceRing({ label, value, tone }: ConfidenceRingProps) {
  const clamped = Math.min(100, Math.max(0, value));
  const offset = CIRCUMFERENCE * (1 - clamped / 100);

  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuetext={`${clamped}%`}
      data-testid={`confidence-ring-${label}`}
      data-tone={tone}
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: VIEWBOX, height: VIEWBOX }}
    >
      <svg
        viewBox={`0 0 ${VIEWBOX} ${VIEWBOX}`}
        className="h-full w-full -rotate-90"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-slate-200"
        />
        <circle
          cx={VIEWBOX / 2}
          cy={VIEWBOX / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          className={`${TONE_STROKE[tone]} stroke-current transition-[stroke-dashoffset] duration-700 ease-out`}
        />
      </svg>
      <span
        aria-hidden="true"
        className={`absolute text-base font-extrabold tabular-nums ${TONE_TEXT[tone]}`}
      >
        {clamped}
        <span className="text-[0.65rem] font-bold">%</span>
      </span>
    </div>
  );
}
