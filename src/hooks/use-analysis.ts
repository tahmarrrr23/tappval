import type { AnalyzeResult } from "@lycorp-jp/tappy";
import useSWRMutation from "swr/mutation";

export interface AnalyzeArgs {
  url: string;
  width: number;
  height: number;
}

async function fetcher(endpoint: string, { arg }: { arg: AnalyzeArgs }) {
  const params = new URLSearchParams({
    url: arg.url,
    width: String(Math.round(arg.width)),
    height: String(Math.round(arg.height)),
  });
  const res = await fetch(`${endpoint}?${params}`);
  if (!res.ok) {
    throw new Error("Failed to analyze");
  }
  return res.json();
}

export function useAnalysis() {
  return useSWRMutation<AnalyzeResult, Error, string, AnalyzeArgs>(
    "/api/analyze",
    fetcher,
  );
}
