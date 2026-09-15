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
import type { Recommendation, SurveyAnalysis, TrendResult } from "./types";

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

export async function downloadProposalDocx(
  trendResult: TrendResult,
  surveyAnalysis: SurveyAnalysis,
  recommendations: Recommendation[]
) {
  const today = new Date().toISOString().slice(0, 10);

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
          new Paragraph({
            spacing: { after: 260 },
            children: [new TextRun({ text: `작성일 ${today}`, size: 17, font: FONT, color: MUTED })],
          }),

          heading("프로젝트 조건"),
          factsTable([
            ["시즌/이벤트", trendResult.season],
            ["예산대", trendResult.budget || "미지정"],
            ["설문 응답자 수", `${surveyAnalysis.total}명`],
          ]),

          heading("시즌 트렌드 요약"),
          bodyText(`트렌드 리서치에서 ${trendResult.items.length}건의 상품을 확인했습니다.`, { color: MUTED }),

          heading("임직원 선호도 요약"),
          bodyText(surveyAnalysis.summary),

          heading("추천 선물군 TOP 3"),
          ...recommendations.flatMap((rec) => [recommendationBlock(rec), new Paragraph({ spacing: { after: 200 }, children: [] })]),

          heading("고객사 제안 시 고려사항"),
          bodyText("• 가격 정보는 검색 시점 기준 참고용이며, 실제 구매 시 변동될 수 있습니다."),
          bodyText("• 연령대/부서 데이터가 제한적인 경우 특정 그룹에 편향된 결과일 수 있습니다."),
          bodyText("• 고객사 요청 예산과 최종 견적은 별도로 확인이 필요합니다."),

          new Paragraph({
            spacing: { before: 400 },
            border: { top: { style: BorderStyle.SINGLE, size: 4, color: LINE, space: 8 } },
            children: [
              new TextRun({
                text: "본 제안서는 선물 트렌드 분석 대시보드에서 자동 생성되었습니다.",
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
