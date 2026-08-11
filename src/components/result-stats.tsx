import type { AnalyzeResult } from "@lycorp-jp/tappy";

export function ResultStats({ data }: { data: AnalyzeResult }) {
  const elements = data.elements ?? [];
  const total = elements.length;
  const avgRate =
    total > 0
      ? elements.reduce((sum, el) => sum + el.tapSuccessRate, 0) / total
      : 0;
  const issues = elements.filter((el) => el.tapSuccessRate < 0.8).length;

  return (
    <section className="flex flex-1 flex-col p-5 sm:p-6" aria-live="polite">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="text-sm font-semibold">Analysis summary</h2>
        <span className="font-mono text-[10px] text-base-content/40">
          TAP SUCCESS RATE
        </span>
      </div>
      <div className="grid grid-cols-1 divide-y divide-base-300 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <div className="flex flex-col gap-1 py-4 sm:py-0 sm:pr-5">
          <span className="text-xs text-base-content/50">Targets</span>
          <span className="font-mono text-3xl font-medium leading-none tabular-nums tracking-[-0.04em]">
            {total}
          </span>
          <span className="text-[11px] text-base-content/40">detected</span>
        </div>
        <div className="flex flex-col gap-1 py-4 sm:px-5 sm:py-0">
          <span className="text-xs text-base-content/50">Avg. Rate</span>
          <span className="font-mono text-3xl font-medium leading-none tabular-nums tracking-[-0.04em]">
            {(avgRate * 100).toFixed(1)}%
          </span>
          <span className="text-[11px] text-base-content/40">
            {avgRate >= 0.95
              ? "Excellent"
              : avgRate >= 0.8
                ? "Needs improvement"
                : "Poor accessibility"}
          </span>
        </div>
        <div className="flex flex-col gap-1 py-4 sm:py-0 sm:pl-5">
          <span className="text-xs text-base-content/50">Issues</span>
          <span className="font-mono text-3xl font-medium leading-none text-error tabular-nums tracking-[-0.04em]">
            {issues}
          </span>
          <span className="text-[11px] text-base-content/40">below 80%</span>
        </div>
      </div>
    </section>
  );
}
