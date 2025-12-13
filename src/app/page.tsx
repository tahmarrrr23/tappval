"use client";

import type { AnalyzeResult } from "@lycorp-jp/tappy";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import useSWRMutation from "swr/mutation";
import { AnalyzeOverlay } from "@/components/analyze-overlay";
import { DeviceMock } from "@/components/device-mock";
import { MonoCard } from "@/components/mono-card";

async function fetcher(url: string, { arg }: { arg: string }) {
  const res = await fetch(`${url}?url=${encodeURIComponent(arg)}`);
  if (!res.ok) {
    throw new Error("Failed to analyze");
  }
  return res.json();
}

export default function Home() {
  const [url, setUrl] = useState("");

  const { trigger, isMutating, data } = useSWRMutation<
    AnalyzeResult,
    Error,
    string,
    string
  >("/api/analyze", fetcher);

  const loading = isMutating;

  const handleAnalyze = async () => {
    if (!url) return;

    try {
      await trigger(url);
    } catch (error) {
      console.error(error);
      alert("エラーが発生しました");
    }
  };

  return (
    <main className="min-h-screen p-8 flex flex-col items-center gap-12">
      <header className="w-full max-w-6xl flex items-center justify-between border-b-4 pb-4">
        <h1 className="text-5xl font-bold tracking-tighter">Tappy Valley_</h1>
        <div className="flex gap-4">
          <a
            href="https://github.com/tahmarrrr23/tappy-valley"
            className="link link-hover join font-bold"
            target="_blank"
            rel="noopener"
          >
            Source
            <ExternalLinkIcon className="join-item" />
          </a>
          <a
            href="https://github.com/yahoojapan/tappy"
            className="link link-hover join font-bold"
            target="_blank"
            rel="noopener"
          >
            Tappy
            <ExternalLinkIcon className="join-item" />
          </a>
        </div>
      </header>

      <div className="flex gap-8 max-w-6xl w-full">
        <div className="flex-1 w-full">
          <MonoCard className="p-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
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
                className="bg-black text-white font-bold py-3 px-8 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest border-2 border-transparent hover:border-black hover:bg-white hover:text-black rounded-sm w-full sm:w-auto"
              >
                {loading ? "Processing..." : "Analyze"}
              </button>
            </div>
          </MonoCard>
        </div>

        <div>
          <DeviceMock className="relative overflow-hidden bg-white border-4 border-black rounded-md shadow-xl box-content">
            <div className="w-full h-full overflow-y-auto no-scrollbar bg-gray-50">
              {data ? (
                <AnalyzeOverlay result={data} />
              ) : (
                <div className="flex items-center justify-center text-gray-400 flex-col gap-4 p-8 text-center border-2 border-dashed border-gray-300 m-4 w-[calc(100%-2rem)] h-[calc(100%-2rem)] rounded-2xl">
                  {loading ? (
                    <div className="flex flex-col items-center gap-4">
                      <div className="animate-spin h-12 w-12 border-4 border-black border-t-transparent rounded-full"></div>
                      <p className="text-black font-bold animate-pulse">
                        CAPTURING...
                      </p>
                    </div>
                  ) : (
                    <>
                      <span className="text-6xl opacity-20">NO DATA</span>
                      <p className="text-sm uppercase tracking-widest">
                        Waiting for input...
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </DeviceMock>
        </div>
      </div>

      <footer className="w-full max-w-6xl border-t-2 border-gray-200 pt-8 mt-auto">
        <p className="text-center text-gray-500 font-mono text-sm">
          &copy; {new Date().getFullYear()} Fumiya Yamashita. All rights
          reserved.
        </p>
      </footer>
    </main>
  );
}
