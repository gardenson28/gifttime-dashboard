"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, Card, EmptyNotice, PrimaryButton, SectionTitle } from "@/components/ui";
import { downloadProposalDocx } from "@/lib/generateProposal";
import { buildRecommendations } from "@/lib/recommend";
import { useStore } from "@/lib/store";

export default function RecommendPage() {
  const { trendResult, surveyAnalysis } = useStore();
  const [generatingProposal, setGeneratingProposal] = useState(false);

  const recommendations = useMemo(() => {
    if (!trendResult || !surveyAnalysis) return null;
    return buildRecommendations(trendResult, surveyAnalysis);
  }, [trendResult, surveyAnalysis]);

  if (!trendResult || !surveyAnalysis) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--ink)]">매칭 추천 리포트</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            트렌드 리서치와 설문 분석 결과를 조합해 추천 선물군을 산출합니다.
          </p>
        </div>
        <Card>
          <EmptyNotice>
            <div className="space-y-2">
              <p>추천을 계산하려면 아래 두 단계를 먼저 완료해주세요.</p>
              <ul className="list-inside list-disc space-y-1">
                {!trendResult && (
                  <li>
                    <Link href="/research" className="text-[var(--brand-hover)] underline">
                      트렌드 리서치
                    </Link>
                    를 먼저 실행해주세요.
                  </li>
                )}
                {!surveyAnalysis && (
                  <li>
                    <Link href="/survey" className="text-[var(--brand-hover)] underline">
                      설문 분석
                    </Link>
                    을 먼저 실행해주세요.
                  </li>
                )}
              </ul>
            </div>
          </EmptyNotice>
        </Card>
      </div>
    );
  }

  async function exportProposal() {
    if (!recommendations || !trendResult || !surveyAnalysis) return;
    setGeneratingProposal(true);
    try {
      await downloadProposalDocx(trendResult, surveyAnalysis, recommendations);
    } finally {
      setGeneratingProposal(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink)]">매칭 추천 리포트</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          "{trendResult.season}" 트렌드 결과와 임직원 설문 분석을 조합한 추천입니다.
        </p>
      </div>

      <Card>
        <SectionTitle title="프로젝트 조건" />
        <div className="grid gap-3 sm:grid-cols-3 text-sm">
          <div>
            <p className="text-[var(--muted)]">시즌/이벤트</p>
            <p className="font-semibold text-[var(--ink)]">{trendResult.season}</p>
          </div>
          <div>
            <p className="text-[var(--muted)]">예산대</p>
            <p className="font-semibold text-[var(--ink)]">{trendResult.budget || "미지정"}</p>
          </div>
          <div>
            <p className="text-[var(--muted)]">설문 응답자 수</p>
            <p className="font-semibold text-[var(--ink)]">{surveyAnalysis.total}명</p>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle title="트렌드·설문 요약" />
        <p className="text-sm text-[var(--ink)]">
          트렌드 리서치에서 {trendResult.items.length}건의 상품을 확인했습니다.
        </p>
        <p className="mt-2 text-sm text-[var(--ink)]">{surveyAnalysis.summary}</p>
      </Card>

      <Card>
        <SectionTitle title="추천 선물군 TOP 3" />
        {!recommendations || recommendations.length === 0 ? (
          <EmptyNotice>추천을 계산할 수 있는 공통 카테고리가 없습니다.</EmptyNotice>
        ) : (
          <div className="space-y-4">
            {recommendations.map((rec) => (
              <div key={rec.rank} className="rounded-lg border border-[var(--border)] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--brand)] text-sm font-bold text-white">
                    {rec.rank}
                  </span>
                  <span className="text-lg font-bold text-[var(--ink)]">{rec.giftGroup} 선물군</span>
                  <Badge tone={rec.budgetFit ? "positive" : "brand"}>
                    {rec.budgetFit ? "예산 적합" : "예산 확인 필요"}
                  </Badge>
                  <Badge>{rec.target}</Badge>
                </div>
                <p className="mt-2 text-sm text-[var(--muted)]">{rec.reason}</p>
                {rec.refTrend.length > 0 && (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    참고 트렌드 상품: {rec.refTrend.join(", ")}
                  </p>
                )}
                <p className="mt-1 text-xs text-[var(--muted)]">설문 근거: {rec.refSurvey}</p>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <SectionTitle title="고객사 제안 시 고려사항" />
        <ul className="list-inside list-disc space-y-1 text-sm text-[var(--ink)]">
          <li>가격 정보는 검색 시점 기준 참고용이며, 실제 구매 시 변동될 수 있습니다.</li>
          <li>연령대/부서 데이터가 제한적인 경우 특정 그룹에 편향된 결과일 수 있습니다.</li>
          <li>고객사 요청 예산과 최종 견적은 별도로 확인이 필요합니다.</li>
        </ul>
      </Card>

      <div className="flex flex-col items-center gap-2 pt-2">
        <PrimaryButton onClick={exportProposal} disabled={generatingProposal} className="px-6 py-3 text-[14px]">
          {generatingProposal ? "제안서 생성 중..." : "고객사 제안서 다운로드 (.docx)"}
        </PrimaryButton>
        <p className="text-xs text-[var(--muted)]">위 내용을 정리한 워드 문서로 바로 다운로드됩니다.</p>
      </div>
    </div>
  );
}
