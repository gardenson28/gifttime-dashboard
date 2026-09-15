import {
  KEYWORD_DICTIONARY,
  NEGATIVE_WORDS,
  POSITIVE_WORDS,
} from "./constants";
import type {
  CategoryCount,
  GroupBreakdown,
  KeywordCount,
  SurveyAnalysis,
  SurveyRow,
} from "./types";

function mostCommon(values: string[]): string {
  if (values.length === 0) return "-";
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  let best = values[0];
  let bestCount = 0;
  for (const [v, c] of counts) {
    if (c > bestCount) {
      best = v;
      bestCount = c;
    }
  }
  return best;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function groupBy(rows: SurveyRow[], key: "ageGroup" | "department"): GroupBreakdown[] {
  const groups = new Map<string, SurveyRow[]>();
  for (const row of rows) {
    const g = row[key];
    if (!g) continue;
    if (!groups.has(g)) groups.set(g, []);
    groups.get(g)!.push(row);
  }
  return Array.from(groups.entries())
    .map(([group, groupRows]) => ({
      group,
      topCategory: mostCommon(groupRows.map((r) => r.category).filter((v): v is string => !!v)),
      topBudget: mostCommon(groupRows.map((r) => r.budget).filter((v): v is string => !!v)),
      avgSatisfaction: average(
        groupRows.map((r) => r.satisfaction).filter((v): v is number => typeof v === "number")
      ),
      count: groupRows.length,
    }))
    .sort((a, b) => b.count - a.count);
}

function analyzeKeywords(comments: string[]): KeywordCount[] {
  const counts = KEYWORD_DICTIONARY.map((word) => ({
    word,
    count: comments.filter((c) => c.includes(word)).length,
  }));
  return counts.sort((a, b) => b.count - a.count);
}

function analyzeSentiment(comments: string[]) {
  let positive = 0;
  let negative = 0;
  let neutral = 0;
  for (const c of comments) {
    const isPositive = POSITIVE_WORDS.some((w) => c.includes(w));
    const isNegative = NEGATIVE_WORDS.some((w) => c.includes(w));
    if (isPositive && !isNegative) positive += 1;
    else if (isNegative && !isPositive) negative += 1;
    else neutral += 1;
  }
  return { positive, negative, neutral };
}

export function analyzeSurvey(rows: SurveyRow[]): SurveyAnalysis {
  const total = rows.length;

  const categoryTally = new Map<string, number>();
  for (const row of rows) {
    if (!row.category) continue;
    categoryTally.set(row.category, (categoryTally.get(row.category) ?? 0) + 1);
  }
  const categoryCounts: CategoryCount[] = Array.from(categoryTally.entries())
    .map(([category, count]) => ({
      category,
      count,
      pct: total > 0 ? Math.round((count / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);

  const hasAge = rows.some((r) => !!r.ageGroup);
  const hasDept = rows.some((r) => !!r.department);
  const hasComment = rows.some((r) => !!r.comment && r.comment.trim().length > 0);

  const byAge = hasAge ? groupBy(rows, "ageGroup") : [];
  const byDept = hasDept ? groupBy(rows, "department") : [];

  const comments = rows.map((r) => r.comment ?? "").filter((c) => c.trim().length > 0);
  const keywords = hasComment ? analyzeKeywords(comments) : [];
  const sentiment = hasComment
    ? analyzeSentiment(comments)
    : { positive: 0, negative: 0, neutral: 0 };

  const topCategory = categoryCounts[0];
  const secondCategory = categoryCounts[1];
  const topKeyword = keywords.find((k) => k.count > 0);

  const summaryParts: string[] = [];
  if (topCategory) {
    summaryParts.push(
      `전체 응답자 ${total}명 중 ${topCategory.category} 카테고리 선호도가 ${topCategory.pct}%로 가장 높게 나타났습니다.`
    );
    if (secondCategory) {
      summaryParts.push(`그 다음은 ${secondCategory.category}(${secondCategory.pct}%)입니다.`);
    }
  }
  if (byAge.length > 0) {
    const sample = byAge[0];
    summaryParts.push(
      `${sample.group} 응답자는 ${sample.topCategory}을(를), 평균 만족도 ${sample.avgSatisfaction}점으로 응답했습니다.`
    );
  }
  if (topKeyword) {
    summaryParts.push(`자유서술 답변에서는 "${topKeyword.word}" 키워드가 ${topKeyword.count}회로 가장 많이 언급되었습니다.`);
  }
  const summary =
    summaryParts.length > 0
      ? summaryParts.join(" ")
      : "분석할 수 있는 데이터가 부족합니다. 카테고리·연령대·부서·자유서술 컬럼이 포함된 CSV를 업로드해주세요.";

  return {
    total,
    categoryCounts,
    hasAge,
    hasDept,
    hasComment,
    byAge,
    byDept,
    keywords,
    sentiment,
    summary,
  };
}
