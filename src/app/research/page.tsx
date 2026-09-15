"use client";

import { useMemo, useState } from "react";
import { BUDGET_CEILING, BUDGET_OPTIONS, CATEGORY_OPTIONS, SEASON_OPTIONS } from "@/lib/constants";
import { Badge, Card, EmptyNotice, ErrorNotice, PrimaryButton, SecondaryButton, SectionTitle } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { TrendItem } from "@/lib/types";

export default function ResearchPage() {
  const { season, budget, setSeason, setBudget, trendResult, setTrendResult, savedCandidates, saveCandidate, removeCandidate } =
    useStore();

  const [seasonInput, setSeasonInput] = useState(season || SEASON_OPTIONS[1]);
  const [customSeason, setCustomSeason] = useState("");
  const [budgetInput, setBudgetInput] = useState(budget || "");
  const [customBudget, setCustomBudget] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>("전체");
  const [onlyWithinBudget, setOnlyWithinBudget] = useState(false);

  const effectiveSeason = seasonInput === "직접 입력" ? customSeason.trim() : seasonInput;
  const effectiveBudget = budgetInput === "직접 입력" ? customBudget.trim() : budgetInput;

  async function runSearch() {
    if (!effectiveSeason) {
      setError("시즌/이벤트를 입력해주세요.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/trend-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ season: effectiveSeason, budget: effectiveBudget || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "검색 중 알 수 없는 오류가 발생했습니다.");
        setTrendResult(null);
        return;
      }
      setSeason(effectiveSeason);
      setBudget(effectiveBudget || "");
      setTrendResult(data);
    } catch {
      setError("검색 요청을 보내지 못했습니다. 네트워크 상태를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  }

  const filteredItems: TrendItem[] = useMemo(() => {
    if (!trendResult) return [];
    return trendResult.items.filter((item) => {
      if (categoryFilter !== "전체" && item.category !== categoryFilter) return false;
      if (onlyWithinBudget && trendResult.budget) {
        const ceiling = BUDGET_CEILING[trendResult.budget];
        if (ceiling !== undefined && item.priceValue !== null && item.priceValue > ceiling) {
          return false;
        }
      }
      return true;
    });
  }, [trendResult, categoryFilter, onlyWithinBudget]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">시즌·이벤트 트렌드 리서치</h1>
        <p className="mt-1 text-sm text-slate-500">
          Claude가 실제 웹 검색으로 사전 조사한 시즌별 기업 선물 트렌드 데이터를 보여줍니다. 실시간 검색이 아닌 사전 조사
          데이터이며, 각 아이템의 출처 링크에서 원문을 확인할 수 있습니다. 사전 조사 데이터가 없는 시즌은 임의로 만들어내지
          않고 오류로 안내합니다.
        </p>
      </div>

      <Card>
        <SectionTitle title="검색 조건" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">시즌/이벤트</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={seasonInput}
              onChange={(e) => setSeasonInput(e.target.value)}
            >
              {SEASON_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
              <option value="직접 입력">직접 입력</option>
            </select>
            {seasonInput === "직접 입력" && (
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="예: 창립기념일"
                value={customSeason}
                onChange={(e) => setCustomSeason(e.target.value)}
              />
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">예산대 (선택사항)</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={budgetInput}
              onChange={(e) => setBudgetInput(e.target.value)}
            >
              <option value="">선택 안 함</option>
              {BUDGET_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
              <option value="직접 입력">직접 입력</option>
            </select>
            {budgetInput === "직접 입력" && (
              <input
                className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                placeholder="예: 7만원대"
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
              />
            )}
          </div>
        </div>
        <div className="mt-4">
          <PrimaryButton onClick={runSearch} disabled={loading}>
            {loading ? "검색 중..." : "트렌드 리서치 실행"}
          </PrimaryButton>
        </div>
        {error && (
          <div className="mt-3">
            <ErrorNotice>{error}</ErrorNotice>
          </div>
        )}
      </Card>

      {trendResult && (
        <Card>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SectionTitle
              title={`"${trendResult.season}" 트렌드 검색 결과`}
              subtitle={trendResult.budget ? `예산대: ${trendResult.budget}` : undefined}
            />
            <Badge tone={trendResult.dataSource === "naver-live" ? "green" : "default"}>
              {trendResult.dataSource === "naver-live" ? "실시간 검색 결과" : "사전 조사 데이터"}
            </Badge>
            <div className="flex gap-2 text-sm">
              <select
                className="rounded-lg border border-slate-300 px-3 py-1.5"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="전체">전체 카테고리</option>
                {CATEGORY_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <label className="flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5">
                <input
                  type="checkbox"
                  checked={onlyWithinBudget}
                  onChange={(e) => setOnlyWithinBudget(e.target.checked)}
                />
                예산 내 상품만
              </label>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <EmptyNotice>조건에 맞는 결과가 없습니다. 필터를 조정해보세요.</EmptyNotice>
          ) : (
            <ul className="space-y-3">
              {filteredItems.map((item, idx) => {
                const saved = savedCandidates.includes(item.name);
                return (
                  <li key={idx} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-800">{item.name}</span>
                          <Badge>{item.category}</Badge>
                          <Badge tone="amber">{item.priceRange}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{item.reason}</p>
                        <a
                          href={item.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-xs text-rose-600 underline"
                        >
                          출처 원문 보기 →
                        </a>
                      </div>
                      <SecondaryButton
                        onClick={() => (saved ? removeCandidate(item.name) : saveCandidate(item.name))}
                      >
                        {saved ? "저장됨 ✓" : "추천 후보로 저장"}
                      </SecondaryButton>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      )}
    </div>
  );
}
