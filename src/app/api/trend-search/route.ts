import { NextRequest, NextResponse } from "next/server";
import curatedData from "@/data/trend-research.json";
import { BUDGET_CEILING, BUDGET_OPTIONS, CATEGORY_SEASON_REASON } from "@/lib/constants";
import type { TrendItem } from "@/lib/types";

type CuratedItem = Omit<TrendItem, "target" | "exactBudgetMatch">;

const CURATED: Record<string, CuratedItem[]> = curatedData;
const MIN_RESULTS = 5;

const CATEGORY_KEYWORD_MAP: { category: string; keywords: string[] }[] = [
  { category: "식품", keywords: ["식품", "과일", "한우", "건강식품", "홍삼", "차", "커피", "음료", "육류", "먹거리"] },
  { category: "생활용품", keywords: ["생활", "주방", "리빙", "수건", "세제", "가전", "홈"] },
  { category: "디지털", keywords: ["디지털", "전자", "이어폰", "충전", "블루투스", "가전제품"] },
  { category: "패션", keywords: ["패션", "의류", "지갑", "가방", "잡화", "스카프", "넥타이"] },
  { category: "문구", keywords: ["문구", "다이어리", "필기", "노트", "펜"] },
];

function classifyCategory(title: string, naverCategory: string): string {
  const haystack = `${title} ${naverCategory}`;
  for (const { category, keywords } of CATEGORY_KEYWORD_MAP) {
    if (keywords.some((k) => haystack.includes(k))) return category;
  }
  return "기타";
}

function stripHtml(text: string): string {
  return text.replace(/<[^>]*>/g, "");
}

function formatPriceRange(price: number): string {
  if (price <= 0) return "가격 정보 없음";
  const man = Math.round(price / 1000) / 10;
  return `약 ${man}만원`;
}

/**
 * 네이버 검색(쇼핑) API가 연결된 경우에만 사용하는 실시간 검색 경로.
 * 지금은 큐레이션 데이터셋(CURATED)이 기본 경로이며, 이 함수는 사전 조사 데이터에 없는
 * 시즌(직접 입력 등)을 위한 보조 수단으로만 호출된다.
 */
async function fetchFromNaver(season: string, budget?: string): Promise<TrendItem[] | { error: string; status: number }> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return { error: "NO_KEY", status: 501 };
  }

  const query = `${season} 기업 선물${budget ? ` ${budget}` : ""}`;
  let res: Response;
  try {
    res = await fetch(
      `https://openapi.naver.com/v1/search/shop.json?query=${encodeURIComponent(query)}&display=20&sort=sim`,
      {
        headers: { "X-Naver-Client-Id": clientId, "X-Naver-Client-Secret": clientSecret },
        cache: "no-store",
      }
    );
  } catch {
    return { error: "검색 서버에 연결하지 못했습니다.", status: 502 };
  }
  if (!res.ok) {
    return { error: `네이버 검색 API 호출에 실패했습니다 (status ${res.status}).`, status: 502 };
  }
  const data = await res.json();
  const rawItems: Array<{ title: string; link: string; lprice: string; category1?: string; category2?: string }> =
    data.items ?? [];
  if (rawItems.length === 0) {
    return { error: "검색 결과가 없습니다.", status: 404 };
  }
  return rawItems.map((raw) => {
    const title = stripHtml(raw.title);
    const category = classifyCategory(title, `${raw.category1 ?? ""} ${raw.category2 ?? ""}`);
    const priceValue = Number(raw.lprice) || null;
    return {
      name: title,
      category,
      priceRange: priceValue ? formatPriceRange(priceValue) : "가격 정보 없음",
      priceValue,
      reason: CATEGORY_SEASON_REASON[category] ?? CATEGORY_SEASON_REASON["기타"],
      target: "전체 임직원",
      source: raw.link,
    };
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const season: string = body?.season?.trim();
  const budget: string | undefined = body?.budget?.trim() || undefined;

  if (!season) {
    return NextResponse.json({ error: "시즌/이벤트를 입력해주세요." }, { status: 400 });
  }

  const curatedItems = CURATED[season];

  if (curatedItems) {
    // 예산대를 지정하면 그 예산대에 정확히 해당하는 아이템을 우선 보여준다.
    // 정확히 일치하는 상품이 너무 적으면(5개 미만), 같은 시즌의 다른 예산대 상품을 예산대가
    // 가까운 순서로 보충해 최소한의 선택지를 제공한다 — 이때 어떤 게 정확히 일치하는지는
    // exactBudgetMatch로 구분해 화면에 표시하므로 예산대를 속이지 않는다.
    const isKnownBudget = budget !== undefined && budget in BUDGET_CEILING;

    let ranked: CuratedItem[] = curatedItems;
    if (isKnownBudget) {
      const budgetIndex = BUDGET_OPTIONS.indexOf(budget as (typeof BUDGET_OPTIONS)[number]);
      ranked = [...curatedItems].sort((a, b) => {
        const aExact = a.priceRange === budget ? 0 : 1;
        const bExact = b.priceRange === budget ? 0 : 1;
        if (aExact !== bExact) return aExact - bExact;
        const aDist = Math.abs(BUDGET_OPTIONS.indexOf(a.priceRange as (typeof BUDGET_OPTIONS)[number]) - budgetIndex);
        const bDist = Math.abs(BUDGET_OPTIONS.indexOf(b.priceRange as (typeof BUDGET_OPTIONS)[number]) - budgetIndex);
        return aDist - bDist;
      });
    }

    const exactCount = isKnownBudget ? curatedItems.filter((i) => i.priceRange === budget).length : ranked.length;
    const selected = isKnownBudget && exactCount < MIN_RESULTS ? ranked.slice(0, MIN_RESULTS) : ranked;

    const items: TrendItem[] = selected.map((item) => ({
      ...item,
      target: "전체 임직원",
      exactBudgetMatch: isKnownBudget ? item.priceRange === budget : true,
    }));

    if (items.length === 0) {
      return NextResponse.json(
        {
          error: `"${season}" 시즌의 사전 조사 데이터가 없습니다. 다른 예산대를 선택해보세요.`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      season,
      budget: budget ?? "",
      items,
      fetchedAt: new Date().toISOString(),
      dataSource: "curated",
    });
  }

  // 사전 조사 데이터에 없는 시즌(직접 입력 등) — 네이버 API 키가 있으면 실시간 검색을 시도하고,
  // 없으면 가짜 데이터를 만들지 않고 정직하게 오류를 안내한다.
  const naverResult = await fetchFromNaver(season, budget);
  if ("error" in naverResult) {
    if (naverResult.status === 501) {
      return NextResponse.json(
        {
          error: `"${season}"에 대한 사전 조사 데이터가 없습니다. 사전 정의된 시즌(설날/추석/입학/졸업/여름휴가/연말/입사/승진) 중에서 선택하거나, 네이버 검색 API 키를 등록하면 이 시즌도 검색할 수 있습니다.`,
        },
        { status: 404 }
      );
    }
    return NextResponse.json({ error: naverResult.error }, { status: naverResult.status });
  }

  return NextResponse.json({
    season,
    budget: budget ?? "",
    items: naverResult,
    fetchedAt: new Date().toISOString(),
    dataSource: "naver-live",
  });
}
