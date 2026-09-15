// 각 트렌드 아이템에 recency("classic" 전체기간 스테디셀러 / "recent" 최근 트렌드)를 부여한다.
const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "src", "data", "trend-research.json");
const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

const RECENT_NAMES = new Set([
  "선택형 모바일 상품권(기프티콘) 세트",
  "초가성비 실속 선물세트",
  "프리미엄 한우 선물세트",
  "브랜드 단체 굿즈 세트",
  "프리미엄 수제 쿠키 세트",
  "미니 보조배터리",
  "모바일 금액권(정관장·하이마트 등)",
  "맞춤 제작 다이어리",
  "브랜드 커스텀 다이어리 (몰스킨 등)",
  "무선 충전기",
  "미니 캔들",
  "섀도우 팔레트·마스크팩 세트",
  "미니 에어프라이어·블루투스 스피커",
  "노이즈캔슬링 이어폰",
  "생산성 앱 구독권",
  "아동용 스마트워치(키즈폰)",
  "무선 이어폰",
  "디지털 노트",
  "문화상품권·기프티콘 세트",
  "선 충전기+손목보호쿠션 세트",
  "무선 마우스·키보드",
  "미니 보조배터리·에코백 세트",
  "무선 마사지기",
  "레터링 축하 케이크",
]);

let total = 0;
let recentCount = 0;
for (const items of Object.values(data)) {
  for (const item of items) {
    item.recency = RECENT_NAMES.has(item.name) ? "recent" : "classic";
    total += 1;
    if (item.recency === "recent") recentCount += 1;
  }
}

fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
console.log(`tagged ${total} items, ${recentCount} recent / ${total - recentCount} classic`);
