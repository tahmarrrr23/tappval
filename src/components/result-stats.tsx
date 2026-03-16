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
    <div className="stats stats-vertical lg:stats-horizontal shadow w-full bg-base-100 border border-base-300">
      <div className="stat">
        <div className="stat-title">Tap Targets</div>
        <div className="stat-value text-2xl">{total}</div>
        <div className="stat-desc">detected elements</div>
      </div>
      <div className="stat">
        <div className="stat-title">Avg. Success Rate</div>
        <div className="stat-value text-2xl">{(avgRate * 100).toFixed(1)}%</div>
        <div className="stat-desc">
          {avgRate >= 0.95
            ? "Excellent"
            : avgRate >= 0.8
              ? "Needs improvement"
              : "Poor accessibility"}
        </div>
      </div>
      <div className="stat">
        <div className="stat-figure text-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="inline-block h-8 w-8 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <title>Issues</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>
        <div className="stat-title">Issues</div>
        <div className="stat-value text-2xl text-error">{issues}</div>
        <div className="stat-desc">below 80% success rate</div>
      </div>
    </div>
  );
}
