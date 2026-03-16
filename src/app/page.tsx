"use client";

import { useState } from "react";
import { Alert } from "@/components/alert";
import { DeviceMock } from "@/components/device-mock";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ResultStats } from "@/components/result-stats";
import { useAnalysis } from "@/hooks/use-analysis";

export default function Home() {
  const [url, setUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { trigger, isMutating: loading, data } = useAnalysis();

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
          {data?.elements && <ResultStats data={data} />}
        </div>
      </div>

      <Footer className="mt-auto" />
    </main>
  );
}
