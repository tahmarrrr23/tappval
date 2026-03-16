import type { AnalyzeResult } from "@lycorp-jp/tappy";
import useSWRMutation from "swr/mutation";

async function fetcher(url: string, { arg }: { arg: string }) {
  const res = await fetch(`${url}?url=${encodeURIComponent(arg)}`);
  if (!res.ok) {
    throw new Error("Failed to analyze");
  }
  return res.json();
}

export function useAnalysis() {
  return useSWRMutation<AnalyzeResult, Error, string, string>(
    "/api/analyze",
    fetcher,
  );
}
