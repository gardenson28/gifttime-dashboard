export type SurveyRow = {
  respondentId: string;
  ageGroup?: string;
  department?: string;
  category?: string;
  budget?: string;
  comment?: string;
  satisfaction?: number;
};

export type CategoryCount = {
  category: string;
  count: number;
  pct: number;
};

export type GroupBreakdown = {
  group: string;
  topCategory: string;
  topBudget: string;
  avgSatisfaction: number;
  count: number;
};

export type KeywordCount = {
  word: string;
  count: number;
};

export type SentimentCounts = {
  positive: number;
  negative: number;
  neutral: number;
};

export type SurveyAnalysis = {
  total: number;
  categoryCounts: CategoryCount[];
  hasAge: boolean;
  hasDept: boolean;
  hasComment: boolean;
  byAge: GroupBreakdown[];
  byDept: GroupBreakdown[];
  keywords: KeywordCount[];
  sentiment: SentimentCounts;
  summary: string;
};

export type TrendItem = {
  name: string;
  category: string;
  priceRange: string;
  priceValue: number | null;
  reason: string;
  target: string;
  source: string;
};

export type TrendResult = {
  season: string;
  budget: string;
  items: TrendItem[];
  fetchedAt: string;
  dataSource?: "curated" | "naver-live";
};

export type Recommendation = {
  rank: number;
  giftGroup: string;
  reason: string;
  target: string;
  budgetFit: boolean;
  priority: number;
  refTrend: string[];
  refSurvey: string;
};
