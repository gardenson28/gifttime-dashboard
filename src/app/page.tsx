"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BUDGET_OPTIONS, SEASON_OPTIONS } from "@/lib/constants";
import { Badge, Card, PrimaryButton, SectionTitle } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function Home() {
  const { season, budget, setSeason, setBudget, trendResult, surveyAnalysis } = useStore();
  const [localSeason, setLocalSeason] = useState(season || SEASON_OPTIONS[1]);
  const [localBudget, setLocalBudget] = useState(budget || BUDGET_OPTIONS[2]);
  const router = useRouter();

  function goToResearch() {
    setSeason(localSeason);
    setBudget(localBudget);
    router.push("/research");
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm font-semibold text-rose-600">감동타임 운영팀 · 포트폴리오 데모</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">
          시즌·이벤트 기반 기업 선물 트렌드 리서치 & 임직원 선호도 분석 대시보드
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
          시즌·예산을 선택해 실제 웹 검색 기반 선물 트렌드를 조사하고, 임직원 설문 데이터를 분석해
          고객사에 제안할 선물군과 그 근거를 자동으로 정리합니다.
        </p>
      </div>

      <Card>
        <SectionTitle title="빠른 시작" subtitle="시즌과 예산대를 먼저 선택하면 리서치·추천 화면에 바로 반영됩니다." />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">시즌/이벤트</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={localSeason}
              onChange={(e) => setLocalSeason(e.target.value)}
            >
              {SEASON_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-600">예산대</label>
            <select
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              value={localBudget}
              onChange={(e) => setLocalBudget(e.target.value)}
            >
              {BUDGET_OPTIONS.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-3">
          <PrimaryButton onClick={goToResearch}>트렌드 리서치 시작</PrimaryButton>
          <Link href="/survey">
            <PrimaryButton className="bg-slate-800 hover:bg-slate-900">설문 분석 시작</PrimaryButton>
          </Link>
          <Link href="/recommend">
            <PrimaryButton className="bg-emerald-600 hover:bg-emerald-700">매칭 추천 결과 바로가기</PrimaryButton>
          </Link>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <SectionTitle title="최근 트렌드 리서치" />
          {trendResult ? (
            <div className="text-sm text-slate-700">
              <p>
                <Badge>{trendResult.season}</Badge>{" "}
                {trendResult.budget && <Badge tone="amber">{trendResult.budget}</Badge>}
              </p>
              <p className="mt-2">검색된 상품 {trendResult.items.length}건</p>
              <Link href="/research" className="mt-2 inline-block text-rose-600 underline">
                자세히 보기 →
              </Link>
            </div>
          ) : (
            <p className="text-sm text-slate-500">아직 실행한 리서치가 없습니다.</p>
          )}
        </Card>
        <Card>
          <SectionTitle title="최근 설문 분석" />
          {surveyAnalysis ? (
            <div className="text-sm text-slate-700">
              <p>응답자 {surveyAnalysis.total}명 분석 완료</p>
              {surveyAnalysis.categoryCounts[0] && (
                <p className="mt-1">
                  1위 카테고리: {surveyAnalysis.categoryCounts[0].category} (
                  {surveyAnalysis.categoryCounts[0].pct}%)
                </p>
              )}
              <Link href="/survey" className="mt-2 inline-block text-rose-600 underline">
                자세히 보기 →
              </Link>
            </div>
          ) : (
            <p className="text-sm text-slate-500">아직 실행한 분석이 없습니다.</p>
          )}
        </Card>
      </div>
    </div>
  );
}
