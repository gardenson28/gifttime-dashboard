export const SEASON_OPTIONS = [
  "설날",
  "추석",
  "입학",
  "졸업",
  "여름휴가",
  "연말",
  "입사",
  "승진",
] as const;

export const BUDGET_OPTIONS = [
  "1만원 이하",
  "1만~3만원",
  "3만~5만원",
  "5만~10만원",
  "10만원 이상",
] as const;

export const CATEGORY_OPTIONS = ["식품", "생활용품", "디지털", "패션", "문구", "기타"] as const;

export const AGE_GROUP_OPTIONS = ["20대", "30대", "40대", "50대 이상"] as const;

export const DEPARTMENT_OPTIONS = ["인사", "영업", "마케팅", "개발", "경영지원"] as const;

// 자유서술 답변에서 찾아볼 핵심 키워드 사전
export const KEYWORD_DICTIONARY = ["실용성", "건강", "취향", "가격", "브랜드", "포장", "배송"] as const;

export const POSITIVE_WORDS = [
  "좋습니다",
  "좋아요",
  "좋은",
  "만족",
  "훌륭",
  "최고",
  "마음에 들",
  "편리",
  "유용",
  "추천",
];

export const NEGATIVE_WORDS = [
  "별로",
  "아쉽",
  "불편",
  "부족",
  "실망",
  "안 좋",
  "안좋",
  "나쁘",
  "불만",
];

// 예산대 문자열에서 대략적인 가격 상한(원)을 추출하기 위한 매핑
export const BUDGET_CEILING: Record<string, number> = {
  "1만원 이하": 10000,
  "1만~3만원": 30000,
  "3만~5만원": 50000,
  "5만~10만원": 100000,
  "10만원 이상": Infinity,
};

// 카테고리 + 시즌 조합에 대한 "인기 이유" 템플릿 (실제 검색 결과 위에 덧붙이는 보조 설명)
export const CATEGORY_SEASON_REASON: Record<string, string> = {
  "식품": "명절·기념일 선물로 활용도가 높고 가족 단위로 소비하기 좋아 기업 선물로 자주 선택되는 카테고리입니다.",
  "생활용품": "실생활에서 꾸준히 쓸 수 있어 실용성을 중시하는 임직원에게 호응이 좋은 카테고리입니다.",
  "디지털": "트렌드에 민감한 젊은 연령대에서 선호도가 높은 카테고리입니다.",
  "패션": "개인 취향이 반영되는 선물로, 승진·입사 등 축하 목적의 선물에 자주 활용됩니다.",
  "문구": "부담 없는 가격대에서 실용적으로 구성할 수 있어 다양한 예산에 맞추기 좋은 카테고리입니다.",
  "기타": "시즌 트렌드 검색 결과에서 발견된 상품입니다.",
};
