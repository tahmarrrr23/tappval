"use client";

import type { AnalyzeResult } from "@lycorp-jp/tappy";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { Alert } from "@/components/alert/alert";
import { Card } from "@/components/card";
import { DevicePreview } from "@/components/device-preview";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";

async function fetcher(url: string, { arg }: { arg: string }) {
  const res = await fetch(`${url}?url=${encodeURIComponent(arg)}`);
  if (!res.ok) {
    throw new Error("Failed to analyze");
  }
  return res.json();
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
    <main className="min-h-screen p-8 flex flex-col items-center gap-12 relative">
      {errorMessage && <Alert message={errorMessage} />}

      <Header />

      <div className="flex gap-8 max-w-6xl w-full">
        <div className="flex-1 w-full">
          <Card className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label
                htmlFor="url-input"
                className="text-xs font-bold uppercase tracking-wider text-gray-400"
              >
                Target URL
              </label>
              <input
                id="url-input"
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="bg-transparent border-2 border-black p-3 focus:outline-none font-mono text-lg placeholder:text-gray-400 rounded-sm w-full"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                onClick={handleAnalyze}
                disabled={loading || !url}
                className="btn btn-neutral rounded-sm px-8 uppercase tracking-widest w-full sm:w-auto font-bold"
              >
                {loading && (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
                {loading ? "Processing..." : "Analyze"}
              </button>
            </div>
          </Card>
        </div>

        <div>
          <DevicePreview result={data ?? null} loading={loading} />
        </div>
      </div>

      <Footer className="mt-auto" />
    </main>
  );
}
