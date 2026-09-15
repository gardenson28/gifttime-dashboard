import Papa from "papaparse";
import type { SurveyRow } from "./types";

const HEADER_ALIASES: Record<keyof SurveyRow, string[]> = {
  respondentId: ["응답자id", "응답자", "id"],
  ageGroup: ["연령대", "나이", "age"],
  department: ["부서", "department", "dept"],
  category: ["선호카테고리", "카테고리", "category"],
  budget: ["선호예산대", "예산대", "예산", "budget"],
  comment: ["자유서술답변", "자유서술", "의견", "코멘트", "comment"],
  satisfaction: ["만족도", "satisfaction", "점수"],
};

function normalizeHeader(header: string): string {
  return header.trim().toLowerCase().replace(/\s+/g, "");
}

function buildHeaderMap(headers: string[]): Partial<Record<keyof SurveyRow, string>> {
  const map: Partial<Record<keyof SurveyRow, string>> = {};
  const normalized = headers.map((h) => ({ raw: h, norm: normalizeHeader(h) }));

  (Object.keys(HEADER_ALIASES) as (keyof SurveyRow)[]).forEach((field) => {
    const aliases = HEADER_ALIASES[field];
    const match = normalized.find((h) => aliases.includes(h.norm));
    if (match) map[field] = match.raw;
  });

  return map;
}

export type ParsedSurvey = {
  rows: SurveyRow[];
  headers: string[];
  mappedFields: (keyof SurveyRow)[];
  unmappedFields: (keyof SurveyRow)[];
};

export function parseSurveyCsv(csvText: string): ParsedSurvey {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const headers = result.meta.fields ?? [];
  const headerMap = buildHeaderMap(headers);

  const rows: SurveyRow[] = result.data.map((raw, idx) => {
    const get = (field: keyof SurveyRow) => {
      const col = headerMap[field];
      return col ? raw[col]?.trim() : undefined;
    };
    const satisfactionRaw = get("satisfaction");
    return {
      respondentId: get("respondentId") || String(idx + 1),
      ageGroup: get("ageGroup") || undefined,
      department: get("department") || undefined,
      category: get("category") || undefined,
      budget: get("budget") || undefined,
      comment: get("comment") || undefined,
      satisfaction: satisfactionRaw ? Number(satisfactionRaw) || undefined : undefined,
    };
  });

  const mappedFields = Object.keys(headerMap) as (keyof SurveyRow)[];
  const unmappedFields = (Object.keys(HEADER_ALIASES) as (keyof SurveyRow)[]).filter(
    (f) => !mappedFields.includes(f)
  );

  return { rows, headers, mappedFields, unmappedFields };
}
