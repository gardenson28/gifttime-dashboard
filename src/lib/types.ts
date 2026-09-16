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
  exactBudgetMatch?: boolean;
  recency?: "classic" | "recent";
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

export const AFFILIATE_STATUS_OPTIONS = ["미접촉", "제안중", "계약완료", "보류"] as const;
export type AffiliateStatus = (typeof AFFILIATE_STATUS_OPTIONS)[number];

export type SalesClient = {
  id: number;
  name: string;
  fee_type: string | null;
  created_at: string;
};

export type SalesAffiliate = {
  id: number;
  client_id: number;
  name: string;
  status: AffiliateStatus;
  expected_revenue: number | null;
  memo: string | null;
  updated_at: string;
};

export type SalesEmployee = {
  id: number;
  client_id: number;
  employee_code: string;
  department: string | null;
  quarter: string;
  usage_amount: number;
  allocated_points: number;
  created_at: string;
};

export type ActivationReport = {
  id: number;
  client_id: number;
  country: string;
  quarter: string;
  target_count: number;
  order_count: number;
  reason_unknown: number;
  reason_nothing_to_buy: number;
  reason_distrust: number;
  memo: string | null;
  created_at: string;
};
