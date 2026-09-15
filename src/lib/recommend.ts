import { BUDGET_CEILING } from "./constants";
import type { Recommendation, SurveyAnalysis, TrendItem, TrendResult } from "./types";

function budgetFits(item: TrendItem, budget: string): boolean {
  const ceiling = BUDGET_CEILING[budget];
  if (ceiling === undefined || item.priceValue === null) return true;
  return item.priceValue <= ceiling;
}

/**
 * 트렌드 리서치 결과 + 설문 분석 결과를 조합해 카테고리별 추천 점수를 매기고
 * TOP3 선물군을 산출한다. 점수 = 설문 선호 순위 가중치 + 자유서술 키워드 겹침 + 예산 적합 보너스.
 */
export function buildRecommendations(
  trend: TrendResult,
  survey: SurveyAnalysis
): Recommendation[] {
  const categoriesInTrend = Array.from(new Set(trend.items.map((i) => i.category)));

  const scored = categoriesInTrend.map((category) => {
    const trendItems = trend.items.filter((i) => i.category === category);
    const surveyRank = survey.categoryCounts.findIndex((c) => c.category === category);
    const surveyEntry = surveyRank >= 0 ? survey.categoryCounts[surveyRank] : undefined;

    // 설문 선호 순위 점수: 1위=40, 2위=30, 3위=20 ... 없으면 0
    const rankScore = surveyEntry ? Math.max(40 - surveyRank * 10, 5) : 0;

    // 자유서술 키워드와 트렌드 인기 이유 텍스트가 겹치는 정도
    const reasonText = trendItems.map((i) => i.reason).join(" ");
    const matchedKeywords = survey.keywords.filter(
      (k) => k.count > 0 && reasonText.includes(k.word)
    );
    const keywordScore = matchedKeywords.reduce((sum, k) => sum + Math.min(k.count, 10), 0);

    // 예산 적합 아이템 비율 보너스
    const fitCount = trendItems.filter((i) => budgetFits(i, trend.budget)).length;
    const budgetScore = trendItems.length > 0 ? (fitCount / trendItems.length) * 20 : 0;

    const score = rankScore + keywordScore + budgetScore;

    return {
      category,
      score,
      surveyEntry,
      matchedKeywords,
      trendItems,
      fitCount,
    };
  });

  scored.sort((a, b) => b.score - a.score);

  const top3 = scored.slice(0, 3);

  return top3.map((entry, idx) => {
    const reasonParts: string[] = [];
    if (entry.surveyEntry) {
      reasonParts.push(
        `설문에서 ${entry.category} 선호도가 ${entry.surveyEntry.pct}%로 상위권입니다.`
      );
    }
    if (entry.matchedKeywords.length > 0) {
      reasonParts.push(
        `자유서술 답변의 "${entry.matchedKeywords.map((k) => k.word).join(", ")}" 키워드와 관련이 있습니다.`
      );
    }
    if (entry.trendItems.length > 0) {
      reasonParts.push(
        `${trend.season} 시즌 트렌드 검색에서도 ${entry.trendItems.length}건의 관련 상품이 확인되었습니다.`
      );
    }
    const reason =
      reasonParts.length > 0
        ? reasonParts.join(" ")
        : `${trend.season} 시즌 트렌드 검색 결과를 바탕으로 한 참고 추천입니다.`;

    let target = "전체 임직원";
    if (survey.byAge.length > 0) {
      const ageMatch = survey.byAge.find((a) => a.topCategory === entry.category);
      if (ageMatch) target = `${ageMatch.group} 임직원`;
    }
    if (target === "전체 임직원" && survey.byDept.length > 0) {
      const deptMatch = survey.byDept.find((d) => d.topCategory === entry.category);
      if (deptMatch) target = `${deptMatch.group} 부서`;
    }

    return {
      rank: idx + 1,
      giftGroup: entry.category,
      reason,
      target,
      budgetFit: entry.trendItems.length === 0 ? true : entry.fitCount > 0,
      priority: idx + 1,
      refTrend: entry.trendItems.slice(0, 3).map((i) => i.name),
      refSurvey: entry.surveyEntry
        ? `${entry.category} 선호 ${entry.surveyEntry.count}명 (${entry.surveyEntry.pct}%)`
        : "설문 데이터에서 직접적인 근거 없음 (트렌드 기반 추천)",
    } satisfies Recommendation;
  });
}
