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
    <div className="border-2 border-black bg-base-100 p-5 shadow-neo">
      <span className="bg-black text-white text-[10px] uppercase tracking-[0.2em] font-black px-2.5 py-1 inline-block mb-4">
        Results
      </span>
      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-base-content/50 font-bold">
            Targets
          </span>
          <span className="text-3xl font-black tabular-nums leading-none">
            {total}
          </span>
          <span className="text-[10px] text-base-content/40 tracking-wide">
            detected
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-base-content/50 font-bold">
            Avg. Rate
          </span>
          <span className="text-3xl font-black tabular-nums leading-none">
            {(avgRate * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-base-content/40 tracking-wide">
            {avgRate >= 0.95
              ? "Excellent"
              : avgRate >= 0.8
                ? "Needs improvement"
                : "Poor accessibility"}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-widest text-base-content/50 font-bold">
            Issues
          </span>
          <span className="text-3xl font-black tabular-nums text-error leading-none">
            {issues}
          </span>
          <span className="text-[10px] text-base-content/40 tracking-wide">
            below 80%
          </span>
        </div>
      </div>
    </div>
  );
}
