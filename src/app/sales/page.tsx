"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge, Card, EmptyNotice, ErrorNotice, PrimaryButton, SecondaryButton, SectionTitle } from "@/components/ui";
import {
  AFFILIATE_STATUS_OPTIONS,
  type ActivationReport,
  type AffiliateStatus,
  type SalesAffiliate,
  type SalesClient,
} from "@/lib/types";

const inputClass =
  "rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]";

function statusTone(status: AffiliateStatus): "default" | "brand" | "positive" | "negative" {
  if (status === "계약완료") return "positive";
  if (status === "제안중") return "brand";
  if (status === "보류") return "negative";
  return "default";
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error ?? "요청 중 오류가 발생했습니다.");
  return data;
}

export default function SalesPage() {
  const [clients, setClients] = useState<SalesClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [newClientName, setNewClientName] = useState("");
  const [tab, setTab] = useState<"affiliates" | "activation">("affiliates");
  const [error, setError] = useState<string | null>(null);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    setLoadingClients(true);
    try {
      const { clients } = await api<{ clients: SalesClient[] }>("/api/sales/clients");
      setClients(clients);
      if (clients.length > 0 && selectedClientId === null) {
        setSelectedClientId(clients[0].id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "고객사 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingClients(false);
    }
  }

  async function handleAddClient() {
    if (!newClientName.trim()) return;
    setError(null);
    try {
      const { client } = await api<{ client: SalesClient }>("/api/sales/clients", {
        method: "POST",
        body: JSON.stringify({ name: newClientName.trim() }),
      });
      setNewClientName("");
      setClients((prev) => [...prev, client].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedClientId(client.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : "고객사 추가에 실패했습니다.");
    }
  }

  const selectedClient = clients.find((c) => c.id === selectedClientId) ?? null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--ink)]">영업 관리</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          새 고객사 없이도 매출을 올리는 두 가지 방법 — 계열사 확산과 활성률 개선을 고객사별로 관리합니다.
        </p>
      </div>

      <Card>
        <SectionTitle title="고객사 선택" />
        {loadingClients ? (
          <p className="text-sm text-[var(--muted)]">불러오는 중...</p>
        ) : (
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-[var(--muted)]">고객사</label>
              <select
                className={inputClass}
                value={selectedClientId ?? ""}
                onChange={(e) => setSelectedClientId(e.target.value ? Number(e.target.value) : null)}
              >
                {clients.length === 0 && <option value="">등록된 고객사 없음</option>}
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end gap-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-[var(--muted)]">새 고객사 추가</label>
                <input
                  className={inputClass}
                  placeholder="예: 삼성전자"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddClient()}
                />
              </div>
              <SecondaryButton onClick={handleAddClient}>추가</SecondaryButton>
            </div>
          </div>
        )}
        {error && (
          <div className="mt-3">
            <ErrorNotice>{error}</ErrorNotice>
          </div>
        )}
      </Card>

      {!selectedClient ? (
        <Card>
          <EmptyNotice>먼저 고객사를 추가해주세요.</EmptyNotice>
        </Card>
      ) : (
        <>
          <div className="flex gap-2">
            <button
              onClick={() => setTab("affiliates")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "affiliates" ? "bg-[var(--brand)] text-white" : "bg-[var(--canvas)] text-[var(--muted)]"
              }`}
            >
              ① 계열사 확산
            </button>
            <button
              onClick={() => setTab("activation")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "activation" ? "bg-[var(--brand)] text-white" : "bg-[var(--canvas)] text-[var(--muted)]"
              }`}
            >
              ② 활성률 리포트
            </button>
          </div>

          {tab === "affiliates" ? (
            <AffiliatesPanel client={selectedClient} />
          ) : (
            <ActivationPanel client={selectedClient} />
          )}
        </>
      )}
    </div>
  );
}

function AffiliatesPanel({ client }: { client: SalesClient }) {
  const [affiliates, setAffiliates] = useState<SalesAffiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [status, setStatus] = useState<AffiliateStatus>("미접촉");
  const [revenue, setRevenue] = useState("");
  const [memo, setMemo] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.id]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { affiliates } = await api<{ affiliates: SalesAffiliate[] }>(
        `/api/sales/affiliates?clientId=${client.id}`
      );
      setAffiliates(affiliates);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!name.trim()) return;
    setError(null);
    try {
      const { affiliate } = await api<{ affiliate: SalesAffiliate }>("/api/sales/affiliates", {
        method: "POST",
        body: JSON.stringify({
          clientId: client.id,
          name,
          status,
          expectedRevenue: revenue ? Number(revenue) : null,
          memo,
        }),
      });
      setAffiliates((prev) => [affiliate, ...prev]);
      setName("");
      setRevenue("");
      setMemo("");
      setStatus("미접촉");
    } catch (e) {
      setError(e instanceof Error ? e.message : "추가에 실패했습니다.");
    }
  }

  async function handleStatusChange(id: number, newStatus: AffiliateStatus) {
    setAffiliates((prev) => prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a)));
    try {
      await api("/api/sales/affiliates", {
        method: "PATCH",
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "상태 변경에 실패했습니다.");
      load();
    }
  }

  async function handleDelete(id: number) {
    setAffiliates((prev) => prev.filter((a) => a.id !== id));
    try {
      await api(`/api/sales/affiliates?id=${id}`, { method: "DELETE" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제에 실패했습니다.");
      load();
    }
  }

  const totalRevenue = useMemo(
    () => affiliates.filter((a) => a.status === "계약완료").reduce((sum, a) => sum + (a.expected_revenue ?? 0), 0),
    [affiliates]
  );

  return (
    <Card>
      <SectionTitle
        title={`${client.name}의 계열사 확산 현황`}
        subtitle="기존 클라이언트의 계열사를 등록하고 접촉 상태를 추적합니다."
      />

      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-[var(--border)] p-3">
        <input className={inputClass} placeholder="계열사명" value={name} onChange={(e) => setName(e.target.value)} />
        <select className={inputClass} value={status} onChange={(e) => setStatus(e.target.value as AffiliateStatus)}>
          {AFFILIATE_STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          className={`${inputClass} w-32`}
          placeholder="예상매출(원)"
          type="number"
          value={revenue}
          onChange={(e) => setRevenue(e.target.value)}
        />
        <input className={inputClass} placeholder="메모" value={memo} onChange={(e) => setMemo(e.target.value)} />
        <PrimaryButton onClick={handleAdd}>추가</PrimaryButton>
      </div>

      {error && (
        <div className="mb-3">
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">불러오는 중...</p>
      ) : affiliates.length === 0 ? (
        <EmptyNotice>등록된 계열사가 없습니다.</EmptyNotice>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead className="text-[var(--muted)]">
                <tr>
                  <th className="pb-2 pr-4">계열사</th>
                  <th className="pb-2 pr-4">상태</th>
                  <th className="pb-2 pr-4">예상매출</th>
                  <th className="pb-2 pr-4">메모</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {affiliates.map((a) => (
                  <tr key={a.id} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-4 font-medium text-[var(--ink)]">{a.name}</td>
                    <td className="py-2 pr-4">
                      <select
                        className="rounded-md border border-[var(--border)] px-2 py-1 text-xs"
                        value={a.status}
                        onChange={(e) => handleStatusChange(a.id, e.target.value as AffiliateStatus)}
                      >
                        {AFFILIATE_STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <span className="ml-2">
                        <Badge tone={statusTone(a.status)}>{a.status}</Badge>
                      </span>
                    </td>
                    <td className="py-2 pr-4">
                      {a.expected_revenue ? `${a.expected_revenue.toLocaleString()}원` : "-"}
                    </td>
                    <td className="py-2 pr-4 text-[var(--muted)]">{a.memo || "-"}</td>
                    <td className="py-2">
                      <button onClick={() => handleDelete(a.id)} className="text-xs text-[var(--negative)] underline">
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 text-sm text-[var(--muted)]">
            계약완료 기준 예상매출 합계: <span className="font-semibold text-[var(--ink)]">{totalRevenue.toLocaleString()}원</span>
          </p>
        </>
      )}
    </Card>
  );
}

function ActivationPanel({ client }: { client: SalesClient }) {
  const [reports, setReports] = useState<ActivationReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState("");
  const [quarter, setQuarter] = useState("");
  const [targetCount, setTargetCount] = useState("");
  const [orderCount, setOrderCount] = useState("");
  const [reasonUnknown, setReasonUnknown] = useState("");
  const [reasonNothing, setReasonNothing] = useState("");
  const [reasonDistrust, setReasonDistrust] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.id]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { reports } = await api<{ reports: ActivationReport[] }>(
        `/api/sales/activation?clientId=${client.id}`
      );
      setReports(reports);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!country.trim() || !quarter.trim() || !targetCount || !orderCount) return;
    setError(null);
    try {
      const { report } = await api<{ report: ActivationReport }>("/api/sales/activation", {
        method: "POST",
        body: JSON.stringify({
          clientId: client.id,
          country,
          quarter,
          targetCount: Number(targetCount),
          orderCount: Number(orderCount),
          reasonUnknown: reasonUnknown ? Number(reasonUnknown) : 0,
          reasonNothingToBuy: reasonNothing ? Number(reasonNothing) : 0,
          reasonDistrust: reasonDistrust ? Number(reasonDistrust) : 0,
        }),
      });
      setReports((prev) => [...prev, report]);
      setCountry("");
      setQuarter("");
      setTargetCount("");
      setOrderCount("");
      setReasonUnknown("");
      setReasonNothing("");
      setReasonDistrust("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "추가에 실패했습니다.");
    }
  }

  async function handleDelete(id: number) {
    setReports((prev) => prev.filter((r) => r.id !== id));
    try {
      await api(`/api/sales/activation?id=${id}`, { method: "DELETE" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제에 실패했습니다.");
      load();
    }
  }

  const chartData = useMemo(
    () =>
      reports.map((r) => ({
        label: `${r.quarter} ${r.country}`,
        rate: r.target_count > 0 ? Math.round((r.order_count / r.target_count) * 1000) / 10 : 0,
      })),
    [reports]
  );

  return (
    <Card>
      <SectionTitle
        title={`${client.name}의 분기별 활성률`}
        subtitle="대상자 → 주문자 → 활성률을 국가·분기별로 기록합니다."
      />

      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-[var(--border)] p-3">
        <input className={`${inputClass} w-28`} placeholder="국가" value={country} onChange={(e) => setCountry(e.target.value)} />
        <input
          className={`${inputClass} w-28`}
          placeholder="분기 (예: 2026-Q3)"
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
        />
        <input
          className={`${inputClass} w-24`}
          placeholder="대상자 수"
          type="number"
          value={targetCount}
          onChange={(e) => setTargetCount(e.target.value)}
        />
        <input
          className={`${inputClass} w-24`}
          placeholder="주문자 수"
          type="number"
          value={orderCount}
          onChange={(e) => setOrderCount(e.target.value)}
        />
        <input
          className={`${inputClass} w-20`}
          placeholder="모른다"
          type="number"
          value={reasonUnknown}
          onChange={(e) => setReasonUnknown(e.target.value)}
        />
        <input
          className={`${inputClass} w-20`}
          placeholder="살게없다"
          type="number"
          value={reasonNothing}
          onChange={(e) => setReasonNothing(e.target.value)}
        />
        <input
          className={`${inputClass} w-20`}
          placeholder="못믿는다"
          type="number"
          value={reasonDistrust}
          onChange={(e) => setReasonDistrust(e.target.value)}
        />
        <PrimaryButton onClick={handleAdd}>추가</PrimaryButton>
      </div>

      {error && (
        <div className="mb-3">
          <ErrorNotice>{error}</ErrorNotice>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-[var(--muted)]">불러오는 중...</p>
      ) : reports.length === 0 ? (
        <EmptyNotice>등록된 분기 리포트가 없습니다.</EmptyNotice>
      ) : (
        <>
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e6ea" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip />
                <Line type="monotone" dataKey="rate" name="활성률(%)" stroke="#FC6C2C" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="text-[var(--muted)]">
                <tr>
                  <th className="pb-2 pr-4">국가</th>
                  <th className="pb-2 pr-4">분기</th>
                  <th className="pb-2 pr-4">대상자</th>
                  <th className="pb-2 pr-4">주문자</th>
                  <th className="pb-2 pr-4">활성률</th>
                  <th className="pb-2 pr-4">미주문 사유(모름/없음/불신)</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-4">{r.country}</td>
                    <td className="py-2 pr-4">{r.quarter}</td>
                    <td className="py-2 pr-4">{r.target_count}</td>
                    <td className="py-2 pr-4">{r.order_count}</td>
                    <td className="py-2 pr-4 font-semibold text-[var(--brand-hover)]">
                      {r.target_count > 0 ? Math.round((r.order_count / r.target_count) * 1000) / 10 : 0}%
                    </td>
                    <td className="py-2 pr-4 text-[var(--muted)]">
                      {r.reason_unknown}/{r.reason_nothing_to_buy}/{r.reason_distrust}
                    </td>
                    <td className="py-2">
                      <button onClick={() => handleDelete(r.id)} className="text-xs text-[var(--negative)] underline">
                        삭제
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
