"""더미 임직원 설문 데이터를 생성해 public/sample-survey.csv로 저장한다.
실제 개인정보는 포함하지 않으며(이름/연락처/이메일 없음), 모두 가상 데이터다.
"""
import csv
import random
from pathlib import Path

random.seed(20260915)

AGE_GROUPS = ["20대", "30대", "40대", "50대 이상"]
DEPARTMENTS = ["인사", "영업", "마케팅", "개발", "경영지원"]
CATEGORIES = ["식품", "생활용품", "디지털", "패션", "문구"]
BUDGETS = ["1만원 이하", "1만~3만원", "3만~5만원", "5만~10만원", "10만원 이상"]

# 연령대별로 카테고리 선호 가중치를 다르게 줘서 분석 결과가 의미 있게 갈리도록 구성
AGE_CATEGORY_WEIGHTS = {
    "20대": {"디지털": 4, "패션": 3, "식품": 2, "생활용품": 1, "문구": 1},
    "30대": {"식품": 4, "생활용품": 3, "디지털": 2, "패션": 1, "문구": 1},
    "40대": {"생활용품": 4, "식품": 3, "문구": 1, "디지털": 1, "패션": 1},
    "50대 이상": {"식품": 4, "생활용품": 3, "문구": 1, "패션": 1, "디지털": 1},
}

COMMENT_TEMPLATES = [
    "실용성이 높은 선물이 좋습니다. 실제로 자주 사용할 수 있는 제품을 선호합니다.",
    "건강을 챙길 수 있는 선물이면 만족스러울 것 같습니다.",
    "개인 취향을 반영한 선물이면 더 특별하게 느껴질 것 같습니다.",
    "가격 대비 품질이 좋은 선물이 가장 중요하다고 생각합니다.",
    "브랜드가 있는 제품이면 신뢰가 가서 선호합니다.",
    "포장이 고급스러우면 선물 받는 기분이 더 좋습니다.",
    "배송이 빠르고 안전하게 오는 것도 중요한 요소입니다.",
    "가족과 함께 사용할 수 있는 실용적인 선물이 좋습니다.",
    "평소에 사고 싶었던 디지털 제품이면 정말 만족스러울 것 같습니다.",
    "너무 가격이 낮은 선물은 다소 아쉽게 느껴질 수 있습니다.",
    "건강기능식품처럼 실질적으로 도움이 되는 선물을 선호합니다.",
    "포장 상태가 부실하면 다소 실망스럽습니다.",
    "매년 비슷한 선물이라 약간 불편한 느낌도 있습니다.",
    "가격보다는 실용성과 포장을 함께 고려해주면 좋겠습니다.",
    "배송이 늦어지면 아쉬운 경험이 될 것 같습니다.",
    "취향에 맞는 선택지가 다양하면 만족도가 높아질 것 같습니다.",
]

random.seed(20260915)


def pick_category(age_group: str) -> str:
    weights = AGE_CATEGORY_WEIGHTS[age_group]
    categories = list(weights.keys())
    weight_values = list(weights.values())
    return random.choices(categories, weights=weight_values, k=1)[0]


def pick_budget(category: str) -> str:
    # 식품/생활용품은 중간 예산대, 디지털/패션은 다소 높은 예산대 쪽으로 치우치게
    if category in ("디지털", "패션"):
        return random.choices(BUDGETS, weights=[1, 2, 3, 3, 2], k=1)[0]
    return random.choices(BUDGETS, weights=[2, 3, 3, 1, 1], k=1)[0]


def pick_satisfaction(age_group: str) -> int:
    base = {"20대": 3.6, "30대": 4.0, "40대": 4.1, "50대 이상": 3.9}[age_group]
    score = round(random.gauss(base, 0.8))
    return max(1, min(5, score))


def build_comment() -> str:
    n = random.choice([1, 1, 2])
    parts = random.sample(COMMENT_TEMPLATES, n)
    return " ".join(parts)


def main():
    rows = []
    total = 60
    for i in range(1, total + 1):
        age_group = random.choice(AGE_GROUPS)
        department = random.choice(DEPARTMENTS)
        category = pick_category(age_group)
        budget = pick_budget(category)
        satisfaction = pick_satisfaction(age_group)
        comment = build_comment()
        rows.append(
            {
                "응답자ID": f"{i:03d}",
                "연령대": age_group,
                "부서": department,
                "선호카테고리": category,
                "선호예산대": budget,
                "자유서술답변": comment,
                "만족도": satisfaction,
            }
        )

    out_path = Path(__file__).resolve().parent.parent / "public" / "sample-survey.csv"
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", newline="", encoding="utf-8-sig") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"generated {len(rows)} rows -> {out_path}")


if __name__ == "__main__":
    main()
