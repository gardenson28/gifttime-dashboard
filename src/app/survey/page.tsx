"use client";

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
import { Badge, Card, EmptyNotice, ErrorNotice, PrimaryButton, SecondaryButton, SectionTitle } from "@/components/ui";
import { useStore } from "@/lib/store";
import type { SurveyRow } from "@/lib/types";

const CHART_COLORS = ["#e11d48", "#f59e0b", "#0ea5e9", "#8b5cf6", "#22c55e", "#94a3b8"];
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
  const { surveyRows, surveyAnalysis, setSurveyData } = useStore();
  const [pendingRows, setPendingRows] = useState<SurveyRow[] | null>(null);
  const [sourceLabel, setSourceLabel] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function analyzeSampledData() {
    setError(null);
    setAnalyzing(true);
    try {
      const res = await fetch("/sample-survey.csv");
      if (!res.ok) throw new Error("샘플 데이터를 불러오지 못했습니다.");
      const text = await res.text();
      const parsed = parseSurveyCsv(text);
      const sample = sampleRandom(parsed.rows, SAMPLE_SIZE);
      const analysis = analyzeSurvey(sample);
      setSurveyData(sample, analysis);
      setPendingRows(null);
      setSourceLabel(`전체 응답자 ${parsed.rows.length}명 중 무작위 ${sample.length}명 표본 분석`);
    } catch {
      setError("샘플 설문 데이터를 불러오는 중 문제가 발생했습니다.");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result ?? "");
        const parsed = parseSurveyCsv(text);
        if (parsed.rows.length === 0) {
          setError("업로드한 CSV에서 데이터를 찾을 수 없습니다. 헤더 행이 있는지 확인해주세요.");
          return;
        }
        setPendingRows(parsed.rows);
        setSourceLabel(`업로드 파일: ${file.name} (${parsed.rows.length}명)`);
      } catch {
        setError("CSV 파일을 읽는 중 문제가 발생했습니다. 형식을 확인해주세요.");
      }
    };
    reader.readAsText(file, "utf-8");
  }

  function runAnalysis() {
    if (!pendingRows) return;
    const analysis = analyzeSurvey(pendingRows);
    setSurveyData(pendingRows, analysis);
  }

  const previewRows = (pendingRows ?? surveyRows).slice(0, 10);
  const analysis = surveyAnalysis;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">임직원 선호도 설문 분석</h1>
        <p className="mt-1 text-sm text-slate-500">
          더미 데이터를 불러오거나 직접 CSV를 업로드해 선호 카테고리·연령대·부서·자유서술 답변을 분석합니다.
        </p>
      </div>

      <Card>
        <SectionTitle
          title="1. 데이터 준비"
          subtitle="더미 설문 500명 중 무작위 100명을 뽑아 바로 분석하거나, 직접 수집한 CSV 파일을 업로드할 수 있습니다."
        />
        <div className="flex flex-wrap gap-3">
          <PrimaryButton onClick={analyzeSampledData} disabled={analyzing}>
            {analyzing ? "분석 중..." : "설문 분석하기"}
          </PrimaryButton>
          <SecondaryButton onClick={() => fileInputRef.current?.click()}>CSV 파일 업로드</SecondaryButton>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
        {sourceLabel && <p className="mt-3 text-sm text-slate-500">현재 데이터: {sourceLabel}</p>}
        {error && <div className="mt-3"><ErrorNotice>{error}</ErrorNotice></div>}

        {previewRows.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-xs">
              <thead className="text-slate-500">
                <tr>
                  <th className="pb-2 pr-3">응답자ID</th>
                  <th className="pb-2 pr-3">연령대</th>
                  <th className="pb-2 pr-3">부서</th>
                  <th className="pb-2 pr-3">선호카테고리</th>
                  <th className="pb-2 pr-3">선호예산대</th>
                  <th className="pb-2 pr-3">만족도</th>
                  <th className="pb-2">자유서술답변</th>
                </tr>
              </thead>
              <tbody>
                {previewRows.map((row, idx) => (
                  <tr key={idx} className="border-t border-slate-100 text-slate-700">
                    <td className="py-1.5 pr-3">{row.respondentId}</td>
                    <td className="py-1.5 pr-3">{row.ageGroup ?? "-"}</td>
                    <td className="py-1.5 pr-3">{row.department ?? "-"}</td>
                    <td className="py-1.5 pr-3">{row.category ?? "-"}</td>
                    <td className="py-1.5 pr-3">{row.budget ?? "-"}</td>
                    <td className="py-1.5 pr-3">{row.satisfaction ?? "-"}</td>
                    <td className="py-1.5 max-w-xs truncate">{row.comment ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pendingRows && (
          <div className="mt-4">
            <PrimaryButton onClick={runAnalysis}>분석 실행</PrimaryButton>
          </div>
        )}
      </Card>

      {analysis && (
        <>
          <Card>
            <SectionTitle title="2. 선호 카테고리 순위" />
            {analysis.categoryCounts.length === 0 ? (
              <EmptyNotice>선호 카테고리 컬럼을 찾을 수 없어 분석을 생략합니다.</EmptyNotice>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={analysis.categoryCounts}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
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
            <SectionTitle title="3. 연령대별 분석" />
            {!analysis.hasAge ? (
              <EmptyNotice>연령대 데이터가 없어 해당 분석을 생략합니다.</EmptyNotice>
            ) : (
              <GroupTable rows={analysis.byAge} />
            )}
          </Card>

          <Card>
            <SectionTitle title="4. 부서별 분석" />
            {!analysis.hasDept ? (
              <EmptyNotice>부서 데이터가 없어 해당 분석을 생략합니다.</EmptyNotice>
            ) : (
              <GroupTable rows={analysis.byDept} />
            )}
          </Card>

          <Card>
            <SectionTitle title="5. 자유서술 답변 분석" />
            {!analysis.hasComment ? (
              <EmptyNotice>자유서술 답변 데이터가 없어 해당 분석을 생략합니다.</EmptyNotice>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-600">주요 키워드 언급 횟수</p>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={analysis.keywords} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
                      <YAxis type="category" dataKey="word" width={70} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#e11d48" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-600">긍정·부정·중립 비율</p>
                  <div className="flex gap-3">
                    <Badge tone="green">긍정 {analysis.sentiment.positive}명</Badge>
                    <Badge tone="default">중립 {analysis.sentiment.neutral}명</Badge>
                    <Badge tone="rose">부정 {analysis.sentiment.negative}명</Badge>
                  </div>
                  <p className="mt-4 text-xs text-slate-500">
                    "좋습니다/만족/편리" 등 긍정 표현, "별로/불편/아쉽" 등 부정 표현이 포함된 응답을 기준으로 한
                    간단 규칙 기반 분류입니다.
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card className="bg-rose-50/60">
            <SectionTitle title="분석 요약" />
            <p className="text-sm leading-relaxed text-slate-700">{analysis.summary}</p>
          </Card>
        </>
      )}
    </div>
  );
}

function GroupTable({ rows }: { rows: { group: string; topCategory: string; topBudget: string; avgSatisfaction: number; count: number }[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead className="text-slate-500">
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
            <tr key={row.group} className="border-t border-slate-100">
              <td className="py-2 pr-4 font-medium text-slate-800">{row.group}</td>
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
