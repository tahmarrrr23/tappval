"use client";

import type { AnalyzeResult } from "@lycorp-jp/tappy";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { Alert } from "@/components/alert/alert";
import { DeviceMock } from "@/components/device-mock";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

async function fetcher(url: string, { arg }: { arg: string }) {
  const res = await fetch(`${url}?url=${encodeURIComponent(arg)}`);
  if (!res.ok) {
    throw new Error("Failed to analyze");
  }
  return res.json();
}

function ResultStats({ data }: { data: AnalyzeResult }) {
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

export default function Home() {
  const [url, setUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { trigger, isMutating, data } = useSWRMutation<
    AnalyzeResult,
    Error,
    string,
    string
  >("/api/analyze", fetcher);

  const loading = isMutating;

  const handleAnalyze = async () => {
    if (!url) return;
    setErrorMessage(null);

    try {
      await trigger(url);
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "An error occurred during analysis. Please check the URL.",
      );
    }
  };

  return (
    <main className="min-h-screen p-6 lg:p-8 flex flex-col items-center gap-8 relative">
      {errorMessage && <Alert message={errorMessage} />}

      <Header />

      <div className="flex flex-col lg:flex-row gap-8 max-w-6xl w-full">
        {/* Left column: Device Mock */}
        <div className="flex justify-center lg:justify-start shrink-0">
          <DeviceMock result={data ?? null} loading={loading} />
        </div>

        {/* Right column: Form + Info */}
        <div className="flex flex-col gap-6 flex-1 lg:sticky lg:top-8 lg:self-start min-w-0">
          {/* URL Input Form */}
          <fieldset className="fieldset bg-base-200 border border-base-300 p-4 rounded-box">
            <legend className="fieldset-legend font-bold">Target URL</legend>
            <div className="join w-full">
              <input
                id="url-input"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAnalyze();
                }}
                className="input join-item flex-1 font-mono w-full"
              />
              <button
                type="submit"
                onClick={handleAnalyze}
                disabled={loading || !url}
                className="btn btn-neutral join-item uppercase tracking-widest font-bold"
              >
                {loading && (
                  <span className="loading loading-spinner loading-sm" />
                )}
                {loading ? "Processing..." : "Analyze"}
              </button>
            </div>
            <p className="label text-xs">
              Enter a URL to analyze tap target accessibility
            </p>
          </fieldset>

          {/* Color Legend */}
          <div className="card card-border bg-base-100 shadow-sm">
            <div className="card-body p-4">
              <h3 className="card-title text-sm">Legend</h3>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <span className="badge badge-success badge-sm" />
                  <span className="text-xs">95%+ (Good)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-warning badge-sm" />
                  <span className="text-xs">80-95% (Needs work)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-error badge-sm" />
                  <span className="text-xs">&lt; 80% (Poor)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Result Stats */}
          {data && data.elements && <ResultStats data={data} />}
        </div>
      </div>

      <Footer className="mt-auto" />
    </main>
  );
}
