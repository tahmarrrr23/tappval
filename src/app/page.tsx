"use client";

import { useRef, useState } from "react";
import { Alert } from "@/components/alert";
import { DeviceMock } from "@/components/device-mock";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { ResultStats } from "@/components/result-stats";
import { useAnalysis } from "@/hooks/use-analysis";

export default function Home() {
  const [url, setUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const { trigger, isMutating: loading, data } = useAnalysis();

  const handleAnalyze = async () => {
    if (!url) return;
    setErrorMessage(null);

    const el = previewRef.current;
    // Subtract border (2px each side) to get the inner content area
    const width = el ? el.clientWidth - 4 : 390;
    const height = el ? el.clientHeight - 4 : 844;

    try {
      await trigger({ url, width, height });
    } catch (error) {
      console.error(error);
      setErrorMessage(
        "An error occurred during analysis. Please check the URL.",
      );
    }
  };

  return (
    <main className="h-screen p-6 lg:p-8 flex flex-col items-center relative overflow-hidden">
      {errorMessage && <Alert message={errorMessage} />}

      <Header />

      <div className="flex flex-col lg:flex-row lg:items-stretch gap-8 max-w-6xl w-full flex-1 min-h-0 py-8">
        {/* Left column: Device Preview */}
        <div ref={previewRef} className="flex flex-col flex-1 min-h-0">
          <DeviceMock
            result={data ?? null}
            loading={loading}
            className="flex-1 min-h-0"
          />
        </div>

        {/* Right column: Form + Info */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* URL Input Form */}
          <div className="border-2 border-black bg-base-100 p-5 shadow-neo">
            <span className="bg-black text-white text-[10px] uppercase tracking-[0.2em] font-black px-2.5 py-1 inline-block mb-4">
              Target URL
            </span>
            <div className="flex w-full">
              <input
                id="url-input"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAnalyze();
                }}
                className="input border-2 border-black border-r-0 flex-1 font-mono w-full focus:outline-none"
              />
              <button
                type="submit"
                onClick={handleAnalyze}
                disabled={loading || !url}
                className="btn btn-neutral border-2 border-black uppercase tracking-widest font-black shadow-neo-sm hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all"
              >
                {loading && (
                  <span className="loading loading-spinner loading-sm" />
                )}
                {loading ? "Processing..." : "Analyze"}
              </button>
            </div>
            <p className="text-[11px] text-base-content/50 mt-2.5 tracking-wide">
              Enter a URL to analyze tap target accessibility
            </p>
          </div>

          {/* Results area — grows to fill remaining space */}
          <div className="flex flex-col gap-6 mt-6 flex-1">
            {/* Color Legend */}
            <div className="border-2 border-black bg-base-100 p-5 shadow-neo">
              <span className="bg-black text-white text-[10px] uppercase tracking-[0.2em] font-black px-2.5 py-1 inline-block mb-4">
                Legend
              </span>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <span className="size-3 border-2 border-black bg-success" />
                  <span className="text-xs font-bold tracking-wide">
                    95%+ Good
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 border-2 border-black bg-warning" />
                  <span className="text-xs font-bold tracking-wide">
                    80-95% Needs work
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 border-2 border-black bg-error" />
                  <span className="text-xs font-bold tracking-wide">
                    &lt;80% Poor
                  </span>
                </div>
              </div>
            </div>

            {/* Analysis Result Stats */}
            {data?.elements && <ResultStats data={data} />}

            {/* Empty state placeholder for future detailed results */}
            {!data?.elements && (
              <div className="border-2 border-dashed border-base-content/15 flex-1 min-h-32 flex items-center justify-center">
                <span className="text-[11px] uppercase tracking-[0.2em] text-base-content/25 font-bold">
                  Analysis results will appear here
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
