import type { TrendResult } from "./types";

export type TrendSearchResult =
  | { ok: true; data: TrendResult }
  | { ok: false; error: string };

export async function fetchTrendResearch(season: string, budget?: string): Promise<TrendSearchResult> {
  try {
    const res = await fetch("/api/trend-search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ season, budget: budget || undefined }),
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, error: data.error ?? "검색 중 알 수 없는 오류가 발생했습니다." };
    }
    return { ok: true, data };
  } catch {
    return { ok: false, error: "검색 요청을 보내지 못했습니다. 네트워크 상태를 확인해주세요." };
  }
}
