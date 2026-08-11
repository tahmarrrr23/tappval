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
    <main className="relative flex min-h-screen flex-col items-center px-4 py-4 sm:px-6 sm:py-6 lg:h-screen lg:overflow-hidden lg:px-8">
      {errorMessage && <Alert message={errorMessage} />}

      <Header />

      <div className="flex w-full max-w-6xl flex-1 flex-col gap-5 py-5 lg:min-h-0 lg:flex-row lg:items-stretch">
        {/* Left column: Device Preview */}
        <div
          ref={previewRef}
          className="flex min-h-[480px] flex-2 flex-col lg:min-h-0"
        >
          <DeviceMock
            result={data ?? null}
            loading={loading}
            className="min-h-0 flex-1"
          />
        </div>

        {/* Right column: Form + Info */}
        <aside className="flex min-w-0 flex-3 flex-col overflow-hidden rounded-md border border-base-300 bg-base-100/95">
          {/* URL Input Form */}
          <form
            className="border-b border-base-300 p-5 sm:p-6"
            onSubmit={(event) => {
              event.preventDefault();
              handleAnalyze();
            }}
          >
            <div className="mb-4 flex items-baseline justify-between gap-4">
              <label
                htmlFor="url-input"
                className="text-sm font-semibold tracking-[-0.01em]"
              >
                Target URL
              </label>
              <span className="font-mono text-[10px] text-base-content/40">
                HTTPS recommended
              </span>
            </div>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <input
                id="url-input"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-11 w-full min-w-0 flex-1 rounded-sm border border-base-300 bg-base-100 px-3.5 font-mono text-sm outline-none transition-colors duration-150 placeholder:text-base-content/30 hover:border-base-content/30 focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button
                type="submit"
                disabled={loading || !url}
                className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-sm bg-base-content px-5 text-sm font-semibold text-base-100 transition-colors duration-150 hover:bg-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-35"
              >
                {loading && (
                  <span className="loading loading-spinner loading-sm" />
                )}
                {loading ? "Processing..." : "Analyze"}
              </button>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-base-content/50">
              Enter a URL to analyze tap target accessibility
            </p>
          </form>

          {/* Results area — grows to fill remaining space */}
          <div className="flex flex-1 flex-col">
            {/* Color Legend */}
            <section className="border-b border-base-300 px-5 py-4 sm:px-6">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <h2 className="mr-auto text-sm font-semibold">Thresholds</h2>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-success" />
                  <span className="font-mono text-[11px] text-base-content/65">
                    95%+ Good
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-warning" />
                  <span className="font-mono text-[11px] text-base-content/65">
                    80–95% Review
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-error" />
                  <span className="font-mono text-[11px] text-base-content/65">
                    &lt;80% Poor
                  </span>
                </div>
              </div>
            </section>

            {/* Analysis Result Stats */}
            {data && <ResultStats data={data} />}

            {/* Empty state placeholder for future detailed results */}
            {!data && (
              <div className="flex min-h-44 flex-1 items-center justify-center p-8 text-center">
                <div className="max-w-60">
                  <span className="mb-3 block font-mono text-[10px] text-primary/70">
                    READY / AWAITING INPUT
                  </span>
                  <p className="text-sm leading-relaxed text-base-content/40">
                    Analysis measurements will appear here after capture.
                  </p>
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>

      <Footer />
    </main>
  );
}
