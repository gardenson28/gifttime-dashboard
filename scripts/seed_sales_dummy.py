"""영업 관리(계열사 확산/임직원 포인트 사용현황) 더미 데이터를 Supabase에 채워 넣는다.
실행 전 기존 sales_* 데이터를 모두 지우고 새로 생성한다 (데모용 가상 데이터).
"""
import os
import random
import psycopg2
from dotenv import load_dotenv

load_dotenv(".env.local")

random.seed(2026091602)

CONN = dict(
    host=os.environ["SUPABASE_DB_HOST"],
    port=os.environ["SUPABASE_DB_PORT"],
    dbname=os.environ["SUPABASE_DB_NAME"],
    user=os.environ["SUPABASE_DB_USER"],
    password=os.environ["SUPABASE_DB_PASSWORD"],
    connect_timeout=10,
)

COMPANIES = {
    "삼성전자": {
        "fee_type": "수수료형",
        "affiliates": [
            "삼성SDI", "삼성전기", "삼성디스플레이", "삼성바이오로직스", "삼성물산",
            "삼성생명", "삼성화재", "삼성증권", "삼성엔지니어링", "삼성중공업",
            "호텔신라", "제일기획",
        ],
    },
    "LG전자": {
        "fee_type": "표준단가형",
        "affiliates": [
            "LG이노텍", "LG디스플레이", "LG유플러스", "LG화학", "LG생활건강",
            "LG에너지솔루션", "LG씨엔에스", "LG헬로비전", "LG상사", "LG하우시스",
            "LG유통", "LG경영연구원",
        ],
    },
    "SK하이닉스": {
        "fee_type": "수수료형",
        "affiliates": [
            "SK텔레콤", "SK이노베이션", "SK바이오팜", "SK쉴더스", "SK네트웍스",
            "SK증권", "SK케미칼", "SK가스", "SK디앤디", "SK실트론",
            "SK머티리얼즈", "SK에코플랜트",
        ],
    },
    "현대자동차": {
        "fee_type": "표준단가형",
        "affiliates": [
            "현대모비스", "현대제철", "기아", "현대글로비스", "현대건설",
            "현대카드", "현대캐피탈", "현대로템", "현대위아", "이노션",
            "현대엔지니어링", "현대오토에버",
        ],
    },
}

STATUS_WEIGHTS = [("미접촉", 4), ("제안중", 3), ("계약완료", 2), ("보류", 1)]
COUNTRIES = ["한국", "베트남", "인도네시아", "중국", "미국", "인도"]
QUARTERS = ["2026-Q1", "2026-Q2"]
DEPARTMENTS = ["국내영업1팀", "국내영업2팀", "해외영업팀", "마케팅팀", "경영지원팀", "구매팀"]
EMPLOYEE_ALLOCATED_POINTS = 300000  # 분기별 지급 포인트(원), 전사 공통
MIN_AFFILIATES = 10


def weighted_status():
    statuses, weights = zip(*STATUS_WEIGHTS)
    return random.choices(statuses, weights=weights, k=1)[0]


def weighted_country():
    # 절반 이상은 국내, 나머지는 해외 계열사 임직원으로 가정
    return random.choices(COUNTRIES, weights=[5, 2, 2, 2, 2, 2], k=1)[0]


def main():
    conn = psycopg2.connect(**CONN)
    conn.autocommit = True
    cur = conn.cursor()

    # 기존 더미 데이터 초기화 (cascade로 하위 테이블도 함께 삭제됨)
    cur.execute("DELETE FROM sales_clients")

    for company_name, info in COMPANIES.items():
        cur.execute(
            "INSERT INTO sales_clients (name, fee_type) VALUES (%s, %s) RETURNING id",
            (company_name, info["fee_type"]),
        )
        client_id = cur.fetchone()[0]

        # 계열사 확산
        k = random.randint(min(MIN_AFFILIATES, len(info["affiliates"])), len(info["affiliates"]))
        chosen_affiliates = random.sample(info["affiliates"], k=k)
        for aff_name in chosen_affiliates:
            status = weighted_status()
            revenue = random.randint(5, 80) * 1_000_000 if status == "계약완료" else (
                random.randint(3, 50) * 1_000_000 if status == "제안중" else None
            )
            memo = {
                "미접촉": "아직 접촉 전",
                "제안중": "견적 협의 중",
                "계약완료": "정기배송 계약 체결",
                "보류": "예산 이슈로 보류",
            }[status]
            cur.execute(
                """INSERT INTO sales_affiliates (client_id, name, status, expected_revenue, memo)
                   VALUES (%s, %s, %s, %s, %s)""",
                (client_id, aff_name, status, revenue, memo),
            )

        # 임직원별 포인트 사용 현황 (최신 분기 기준)
        employee_count = random.randint(15, 30)
        for i in range(1, employee_count + 1):
            code = f"{company_name[:2]}-EMP{i:03d}"
            dept = random.choice(DEPARTMENTS)
            country = weighted_country()
            is_active = random.random() > 0.35  # 약 35%는 미사용(비활성)
            usage = random.randint(10, EMPLOYEE_ALLOCATED_POINTS // 1000) * 1000 if is_active else 0
            cur.execute(
                """INSERT INTO sales_employees
                   (client_id, employee_code, department, country, quarter, usage_amount, allocated_points)
                   VALUES (%s, %s, %s, %s, %s, %s, %s)""",
                (client_id, code, dept, country, QUARTERS[-1], usage, EMPLOYEE_ALLOCATED_POINTS),
            )

    cur.execute("SELECT count(*) FROM sales_clients")
    print("clients:", cur.fetchone()[0])
    cur.execute("SELECT count(*) FROM sales_affiliates")
    print("affiliates:", cur.fetchone()[0])
    cur.execute("SELECT count(*) FROM sales_employees")
    print("employees:", cur.fetchone()[0])

    cur.close()
    conn.close()


if __name__ == "__main__":
    main()
