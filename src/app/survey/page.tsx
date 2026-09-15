"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { analyzeSurvey } from "@/lib/analysis";
import { parseSurveyCsv } from "@/lib/csv";
import { Badge, Card, EmptyNotice, ErrorNotice, PrimaryButton, SectionTitle } from "@/components/ui";
import { IconUpload } from "@/components/icons";
import { useStore } from "@/lib/store";

const CHART_COLORS = ["#fc6c2c", "#2b3648", "#f4a950", "#3f7c74", "#16a463", "#9aa0ab"];
const SAMPLE_SIZE = 100;

function sampleRandom<T>(rows: T[], size: number): T[] {
  const shuffled = [...rows];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, size);
}

export default function SurveyPage() {
  const { surveyAnalysis, setSurveyData } = useStore();
  const [fileName, setFileName] = useState<string | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [hasRunThisVisit, setHasRunThisVisit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadedFileRef = useRef<File | null>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    uploadedFileRef.current = file;
    setFileName(file.name);
  }

  async function runAnalysis() {
    setError(null);
    setAnalyzing(true);
    try {
      const file = uploadedFileRef.current;
      if (file) {
        const text = await file.text();
        const parsed = parseSurveyCsv(text);
        if (parsed.rows.length === 0) {
          setError("업로드한 파일에서 데이터를 찾을 수 없습니다. 헤더 행이 있는 CSV 형식인지 확인해주세요.");
          return;
        }
        const analysis = analyzeSurvey(parsed.rows);
        setSurveyData(parsed.rows, analysis);
        setSourceLabel(`업로드 파일: ${file.name} (${parsed.rows.length}명)`);
      } else {
        const res = await fetch("/sample-survey.csv");
        if (!res.ok) throw new Error("샘플 데이터를 불러오지 못했습니다.");
        const text = await res.text();
        const parsed = parseSurveyCsv(text);
        const sample = sampleRandom(parsed.rows, SAMPLE_SIZE);
        const analysis = analyzeSurvey(sample);
        setSurveyData(sample, analysis);
        setSourceLabel(`전체 응답자 ${parsed.rows.length}명 중 무작위 ${sample.length}명 표본 분석`);
      }
      setHasRunThisVisit(true);
    } catch {
      setError("설문 데이터를 분석하는 중 문제가 발생했습니다.");
    } finally {
      setAnalyzing(false);
    }
  }

  const analysis = hasRunThisVisit ? surveyAnalysis : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink)]">임직원 선호도 설문 분석</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          설문 데이터 파일을 업로드하고 분석을 실행하면 선호 카테고리·연령대·부서·자유서술 답변 분석 결과를 볼 수 있습니다.
        </p>
      </div>

      <Card>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--canvas)] px-6 py-10 text-center transition hover:border-[var(--brand)] hover:bg-[var(--brand-soft)]"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface)] text-[var(--brand)]">
            <IconUpload className="h-5 w-5" />
          </span>
          <span className="text-sm font-semibold text-[var(--ink)]">
            {fileName ?? "설문 데이터 파일을 업로드하세요 (Excel/CSV)"}
          </span>
          <span className="text-xs text-[var(--faint)]">클릭해서 파일 선택 · 응답자ID, 연령대, 부서, 선호카테고리, 선호예산대, 자유서술답변, 만족도 컬럼 지원</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={handleFileSelect}
        />

        <div className="mt-4 flex justify-center">
          <PrimaryButton onClick={runAnalysis} disabled={analyzing}>
            {analyzing ? "분석 중..." : "설문 분석하기"}
          </PrimaryButton>
        </div>
        {error && (
          <div className="mt-3">
            <ErrorNotice>{error}</ErrorNotice>
          </div>
        )}
      </Card>

      {analysis && (
        <>
          <Card>
            <SectionTitle title="1. 선호 카테고리 순위" />
            {analysis.categoryCounts.length === 0 ? (
              <EmptyNotice>선호 카테고리 컬럼을 찾을 수 없어 분석을 생략합니다.</EmptyNotice>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analysis.categoryCounts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e6ea" />
                    <XAxis dataKey="category" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {analysis.categoryCounts.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie
                      data={analysis.categoryCounts}
                      dataKey="count"
                      nameKey="category"
                      innerRadius={60}
                      outerRadius={95}
                      paddingAngle={2}
                    >
                      {analysis.categoryCounts.map((_, idx) => (
                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          <Card>
            <SectionTitle title="2. 연령대별 분석" />
            {!analysis.hasAge ? (
              <EmptyNotice>연령대 데이터가 없어 해당 분석을 생략합니다.</EmptyNotice>
            ) : (
              <GroupTable rows={analysis.byAge} />
            )}
          </Card>

          <Card>
            <SectionTitle title="3. 부서별 분석" />
            {!analysis.hasDept ? (
              <EmptyNotice>부서 데이터가 없어 해당 분석을 생략합니다.</EmptyNotice>
            ) : (
              <GroupTable rows={analysis.byDept} />
            )}
          </Card>

          <Card>
            <SectionTitle title="4. 자유서술 답변 분석" />
            {!analysis.hasComment ? (
              <EmptyNotice>자유서술 답변 데이터가 없어 해당 분석을 생략합니다.</EmptyNotice>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-semibold text-[var(--muted)]">주요 키워드 언급 횟수</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analysis.keywords} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e6ea" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="word" width={70} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#fc6c2c" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-[var(--muted)]">긍정·부정·중립 비율</p>
                  <div className="flex gap-3">
                    <Badge tone="positive">긍정 {analysis.sentiment.positive}명</Badge>
                    <Badge tone="default">중립 {analysis.sentiment.neutral}명</Badge>
                    <Badge tone="negative">부정 {analysis.sentiment.negative}명</Badge>
                  </div>
                  <p className="mt-4 text-xs text-[var(--muted)]">
                    "좋습니다/만족/편리" 등 긍정 표현, "별로/불편/아쉽" 등 부정 표현이 포함된 응답을 기준으로 한
                    간단 규칙 기반 분류입니다.
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card className="bg-[var(--brand-soft)]">
            <SectionTitle title="분석 요약" />
            <p className="text-sm leading-relaxed text-[var(--ink)]">{analysis.summary}</p>
            {sourceLabel && <p className="mt-2 text-xs text-[var(--faint)]">데이터 출처: {sourceLabel}</p>}
          </Card>

          <div className="flex justify-center">
            <Link href="/recommend">
              <PrimaryButton className="bg-[var(--positive)] hover:bg-[#0f7a4c]">
                이 분석으로 매칭 추천 보기 →
              </PrimaryButton>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function GroupTable({ rows }: { rows: { group: string; topCategory: string; topBudget: string; avgSatisfaction: number; count: number }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="text-[var(--muted)]">
          <tr>
            <th className="pb-2 pr-4">그룹</th>
            <th className="pb-2 pr-4">응답자 수</th>
            <th className="pb-2 pr-4">선호 카테고리</th>
            <th className="pb-2 pr-4">선호 예산대</th>
            <th className="pb-2">평균 만족도</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.group} className="border-t border-[var(--border)]">
              <td className="py-2 pr-4 font-medium text-[var(--ink)]">{row.group}</td>
              <td className="py-2 pr-4">{row.count}명</td>
              <td className="py-2 pr-4">{row.topCategory}</td>
              <td className="py-2 pr-4">{row.topBudget}</td>
              <td className="py-2">{row.avgSatisfaction} / 5</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
