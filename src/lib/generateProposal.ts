"use client";

import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { Recommendation, SurveyAnalysis, TrendItem, TrendResult } from "./types";

const FONT = "맑은 고딕";
const PAGE_W = 11906; // A4 dxa
const MARGIN = 1134;
const CONTENT_W = PAGE_W - MARGIN * 2;

const INK = "1A2230";
const MUTED = "5C6773";
const BRAND = "FC6C2C";
const BRAND_SOFT = "FEF1E8";
const LINE = "E3E5E9";

function noBorders() {
  const b = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  return { top: b, bottom: b, left: b, right: b };
}
function thinBorder() {
  const b = { style: BorderStyle.SINGLE, size: 4, color: LINE };
  return { top: b, bottom: b, left: b, right: b };
}

function bodyText(text: string, opts: { size?: number; color?: string; bold?: boolean } = {}) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text, font: FONT, size: opts.size ?? 21, color: opts.color ?? INK, bold: opts.bold }),
    ],
  });
}

function heading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 140 },
    children: [new TextRun({ text, font: FONT, color: INK })],
  });
}

function dataTable(headers: string[], rows: string[][], colRatios?: number[]) {
  const ratios = colRatios ?? headers.map(() => 1 / headers.length);
  const widths = ratios.map((r) => Math.round(CONTENT_W * r));
  widths[widths.length - 1] += CONTENT_W - widths.reduce((a, b) => a + b, 0);

  const cellBorders = {
    top: { style: BorderStyle.SINGLE, size: 3, color: LINE },
    bottom: { style: BorderStyle.SINGLE, size: 3, color: LINE },
    left: { style: BorderStyle.SINGLE, size: 3, color: LINE },
    right: { style: BorderStyle.SINGLE, size: 3, color: LINE },
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map(
      (h, idx) =>
        new TableCell({
          width: { size: widths[idx], type: WidthType.DXA },
          shading: { fill: BRAND_SOFT, type: ShadingType.CLEAR, color: "auto" },
          borders: cellBorders,
          margins: { top: 100, bottom: 100, left: 100, right: 100 },
          children: [new Paragraph({ children: [new TextRun({ text: h, size: 18, font: FONT, color: INK, bold: true })] })],
        })
    ),
  });

  const bodyRows = rows.map(
    (cells) =>
      new TableRow({
        children: cells.map(
          (c, idx) =>
            new TableCell({
              width: { size: widths[idx], type: WidthType.DXA },
              borders: cellBorders,
              margins: { top: 90, bottom: 90, left: 100, right: 100 },
              children: [new Paragraph({ children: [new TextRun({ text: c, size: 18, font: FONT, color: INK })] })],
            })
        ),
      })
  );

  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [headerRow, ...bodyRows],
  });
}

function factsTable(rows: [string, string][]) {
  const kW = Math.round(CONTENT_W * 0.28);
  const vW = CONTENT_W - kW;
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [kW, vW],
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: LINE },
      left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 3, color: LINE },
      insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
    },
    rows: rows.map(
      ([k, v]) =>
        new TableRow({
          children: [
            new TableCell({
              width: { size: kW, type: WidthType.DXA },
              margins: { top: 100, bottom: 100, left: 80, right: 80 },
              children: [new Paragraph({ children: [new TextRun({ text: k, size: 19, font: FONT, color: MUTED })] })],
            }),
            new TableCell({
              width: { size: vW, type: WidthType.DXA },
              margins: { top: 100, bottom: 100, left: 80, right: 80 },
              children: [new Paragraph({ children: [new TextRun({ text: v, size: 19, font: FONT, color: INK, bold: true })] })],
            }),
          ],
        })
    ),
  });
}

function recommendationBlock(rec: Recommendation) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    borders: thinBorder(),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: CONTENT_W, type: WidthType.DXA },
            shading: { fill: "FFFFFF", type: ShadingType.CLEAR, color: "auto" },
            margins: { top: 160, bottom: 160, left: 200, right: 200 },
            children: [
              new Paragraph({
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: `${rec.priority}순위 · `, bold: true, size: 21, font: FONT, color: BRAND }),
                  new TextRun({ text: `${rec.giftGroup} 선물군`, bold: true, size: 23, font: FONT, color: INK }),
                ],
              }),
              new Paragraph({
                spacing: { after: 60 },
                children: [
                  new TextRun({ text: "적합 대상  ", size: 18, font: FONT, color: MUTED }),
                  new TextRun({ text: rec.target, size: 18, font: FONT, color: INK, bold: true }),
                  new TextRun({ text: "   ·   예산 적합성  ", size: 18, font: FONT, color: MUTED }),
                  new TextRun({
                    text: rec.budgetFit ? "적합" : "예산 확인 필요",
                    size: 18,
                    font: FONT,
                    color: rec.budgetFit ? "16A463" : "EE4D67",
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                spacing: { after: 80 },
                children: [new TextRun({ text: rec.reason, size: 20, font: FONT, color: INK })],
              }),
              ...(rec.refTrend.length > 0
                ? [
                    new Paragraph({
                      spacing: { after: 40 },
                      children: [
                        new TextRun({ text: "참고 트렌드 상품: ", size: 17, font: FONT, color: MUTED }),
                        new TextRun({ text: rec.refTrend.join(", "), size: 17, font: FONT, color: MUTED }),
                      ],
                    }),
                  ]
                : []),
              new Paragraph({
                children: [
                  new TextRun({ text: "설문 근거: ", size: 17, font: FONT, color: MUTED }),
                  new TextRun({ text: rec.refSurvey, size: 17, font: FONT, color: MUTED }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

const EXECUTION_TIMELINE: [string, string, string][] = [
  ["① 상담 및 요구사항 확정", "계약 전 3~5일", "선물 구성, 예산, 배송 대상·지역 협의"],
  ["② 상품 확정 및 견적 승인", "계약 전 1~3일", "최종 구성 확정 및 세금계산서 발행 준비"],
  ["③ 계약 체결", "D-Day", "정식 계약서 체결 및 발주 확정"],
  ["④ 발주·생산·개별 포장", "계약 후 1~7일", "물량 확보 및 개별 포장 진행"],
  ["⑤ 배송", "계약 후 7~14일", "전국 배송 (해외 대상 포함 시 통관 기간 별도 소요)"],
  ["⑥ 배송 확인 및 사후 관리", "배송 완료 후", "수령 확인 및 만족도 피드백 수집"],
];

export async function downloadProposalDocx(
  trendResult: TrendResult,
  surveyAnalysis: SurveyAnalysis,
  recommendations: Recommendation[],
  options: { clientName?: string; headcount: number }
) {
  const today = new Date().toISOString().slice(0, 10);
  const { clientName, headcount } = options;

  const pricedItems = trendResult.items.filter(
    (i): i is TrendItem & { priceValue: number } => i.priceValue !== null
  );
  const avgUnitPrice =
    pricedItems.length > 0
      ? Math.round(pricedItems.reduce((sum, i) => sum + i.priceValue, 0) / pricedItems.length)
      : null;
  const totalBudget = avgUnitPrice !== null ? avgUnitPrice * headcount : null;

  const productRows = trendResult.items
    .slice(0, 10)
    .map((i) => [i.name, i.category, i.priceRange, i.reason]);

  const categoryRows = surveyAnalysis.categoryCounts.map((c) => [c.category, `${c.count}명`, `${c.pct}%`]);

  const ageRows = surveyAnalysis.byAge.map((g) => [
    g.group,
    `${g.count}명`,
    g.topCategory,
    g.topBudget,
    `${g.avgSatisfaction} / 5`,
  ]);

  const deptRows = surveyAnalysis.byDept.map((g) => [
    g.group,
    `${g.count}명`,
    g.topCategory,
    g.topBudget,
    `${g.avgSatisfaction} / 5`,
  ]);

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: 16838 },
            margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
          },
        },
        children: [
          new Paragraph({
            spacing: { after: 40 },
            children: [new TextRun({ text: "기업 선물 제안서", size: 17, font: FONT, color: MUTED })],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: `${trendResult.season} 시즌 임직원 선물 제안`,
                bold: true,
                size: 40,
                font: FONT,
                color: INK,
              }),
            ],
          }),
          ...(clientName
            ? [
                new Paragraph({
                  spacing: { after: 60 },
                  children: [new TextRun({ text: `수신: ${clientName} 귀중`, bold: true, size: 21, font: FONT, color: INK })],
                }),
              ]
            : []),
          new Paragraph({
            spacing: { after: 260 },
            children: [new TextRun({ text: `작성일 ${today}`, size: 17, font: FONT, color: MUTED })],
          }),

          heading("프로젝트 조건"),
          factsTable([
            ["시즌/이벤트", trendResult.season],
            ["예산대", trendResult.budget || "미지정"],
            ["대상 인원수", `${headcount.toLocaleString("ko-KR")}명`],
            ["설문 응답자 수", `${surveyAnalysis.total}명`],
          ]),

          ...(totalBudget !== null
            ? [
                heading("예상 예산"),
                factsTable([
                  ["1인 평균 단가", `${avgUnitPrice!.toLocaleString("ko-KR")}원`],
                  ["대상 인원수", `${headcount.toLocaleString("ko-KR")}명`],
                  ["총 예상 예산 (부가세 별도)", `${totalBudget.toLocaleString("ko-KR")}원`],
                ]),
              ]
            : []),

          heading("시즌 트렌드 상품 리스트"),
          bodyText(`${trendResult.season} 시즌 트렌드 리서치에서 확인된 상품 ${trendResult.items.length}건 중 대표 상품입니다.`, {
            color: MUTED,
          }),
          dataTable(["상품명", "카테고리", "예상가격", "특징"], productRows, [0.24, 0.12, 0.16, 0.48]),

          heading("임직원 선호도 분석"),
          bodyText(surveyAnalysis.summary),
          dataTable(["카테고리", "응답자 수", "비율"], categoryRows, [0.4, 0.3, 0.3]),
          ...(surveyAnalysis.hasAge
            ? [
                new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "연령대별 분석", bold: true, size: 20, font: FONT, color: INK })] }),
                dataTable(["그룹", "응답자 수", "선호 카테고리", "선호 예산대", "평균 만족도"], ageRows, [0.16, 0.16, 0.22, 0.22, 0.24]),
              ]
            : []),
          ...(surveyAnalysis.hasDept
            ? [
                new Paragraph({ spacing: { before: 200, after: 100 }, children: [new TextRun({ text: "부서별 분석", bold: true, size: 20, font: FONT, color: INK })] }),
                dataTable(["그룹", "응답자 수", "선호 카테고리", "선호 예산대", "평균 만족도"], deptRows, [0.16, 0.16, 0.22, 0.22, 0.24]),
              ]
            : []),

          heading("추천 선물군 TOP 3"),
          ...recommendations.flatMap((rec) => [recommendationBlock(rec), new Paragraph({ spacing: { after: 200 }, children: [] })]),

          heading("실행 일정"),
          dataTable(["단계", "예상 소요", "주요 내용"], EXECUTION_TIMELINE.map((r) => [...r]), [0.24, 0.18, 0.58]),
          bodyText("* 실제 일정은 물량 및 배송지역(해외 포함 여부)에 따라 협의를 통해 조정될 수 있습니다.", {
            size: 16,
            color: MUTED,
          }),

          new Paragraph({
            spacing: { before: 400 },
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 8 } },
            children: [
              new TextRun({
                text: "본 제안서는 이트너스 대시보드에서 자동 생성되었습니다.",
                size: 16,
                italics: true,
                font: FONT,
                color: MUTED,
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `선물제안서_${trendResult.season}_${today}.docx`;
  a.click();
  URL.revokeObjectURL(url);
}
