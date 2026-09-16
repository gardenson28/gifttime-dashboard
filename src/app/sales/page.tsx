"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge, Card, EmptyNotice, ErrorNotice, PrimaryButton, SecondaryButton, SectionTitle } from "@/components/ui";
import {
  AFFILIATE_STATUS_OPTIONS,
  type AffiliateStatus,
  type SalesAffiliate,
  type SalesClient,
  type SalesEmployee,
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

type SalesTab = "affiliates" | "employees";

function tabFromParam(value: string | null): SalesTab {
  return value === "employees" ? value : "affiliates";
}

export default function SalesPage() {
  return (
    <Suspense fallback={null}>
      <SalesPageInner />
    </Suspense>
  );
}

function SalesPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [clients, setClients] = useState<SalesClient[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);
  const [newClientName, setNewClientName] = useState("");
  const [tab, setTab] = useState<SalesTab>(() => tabFromParam(searchParams.get("tab")));
  const [error, setError] = useState<string | null>(null);
  const [loadingClients, setLoadingClients] = useState(true);

  useEffect(() => {
    loadClients();
  }, []);

  useEffect(() => {
    setTab(tabFromParam(searchParams.get("tab")));
  }, [searchParams]);

  function selectTab(next: SalesTab) {
    setTab(next);
    router.replace(`/sales?tab=${next}`, { scroll: false });
  }

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
          새 고객사 없이도 매출을 올리는 두 가지 방법 — 계열사 확산과 임직원 포인트 사용 현황을 고객사별로 관리합니다.
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
              onClick={() => selectTab("affiliates")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "affiliates" ? "bg-[var(--brand)] text-white" : "bg-[var(--canvas)] text-[var(--muted)]"
              }`}
            >
              ① 계열사 확산
            </button>
            <button
              onClick={() => selectTab("employees")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
                tab === "employees" ? "bg-[var(--brand)] text-white" : "bg-[var(--canvas)] text-[var(--muted)]"
              }`}
            >
              ② 임직원 포인트 사용 현황
            </button>
          </div>

          {tab === "affiliates" ? (
            <AffiliatesPanel client={selectedClient} />
          ) : (
            <EmployeesPanel client={selectedClient} />
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

function EmployeesPanel({ client }: { client: SalesClient }) {
  const [employees, setEmployees] = useState<SalesEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [employeeCode, setEmployeeCode] = useState("");
  const [department, setDepartment] = useState("");
  const [country, setCountry] = useState("");
  const [quarter, setQuarter] = useState("");
  const [usageAmount, setUsageAmount] = useState("");
  const [allocatedPoints, setAllocatedPoints] = useState("300000");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client.id]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const { employees } = await api<{ employees: SalesEmployee[] }>(
        `/api/sales/employees?clientId=${client.id}`
      );
      setEmployees(employees);
    } catch (e) {
      setError(e instanceof Error ? e.message : "불러오기에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAdd() {
    if (!employeeCode.trim() || !quarter.trim()) return;
    setError(null);
    try {
      const { employee } = await api<{ employee: SalesEmployee }>("/api/sales/employees", {
        method: "POST",
        body: JSON.stringify({
          clientId: client.id,
          employeeCode,
          department,
          country,
          quarter,
          usageAmount: usageAmount ? Number(usageAmount) : 0,
          allocatedPoints: allocatedPoints ? Number(allocatedPoints) : 300000,
        }),
      });
      setEmployees((prev) => [...prev, employee]);
      setEmployeeCode("");
      setDepartment("");
      setCountry("");
      setUsageAmount("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "추가에 실패했습니다.");
    }
  }

  async function handleDelete(id: number) {
    setEmployees((prev) => prev.filter((e) => e.id !== id));
    try {
      await api(`/api/sales/employees?id=${id}`, { method: "DELETE" });
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제에 실패했습니다.");
      load();
    }
  }

  const activeCount = useMemo(() => employees.filter((e) => e.usage_amount > 0).length, [employees]);
  const totalUsage = useMemo(() => employees.reduce((sum, e) => sum + e.usage_amount, 0), [employees]);
  const totalAllocated = useMemo(() => employees.reduce((sum, e) => sum + e.allocated_points, 0), [employees]);
  const avgUsage = employees.length > 0 ? Math.round(totalUsage / employees.length) : 0;
  const avgUsageRate = totalAllocated > 0 ? Math.round((totalUsage / totalAllocated) * 1000) / 10 : 0;

  function usageRate(emp: SalesEmployee): number | null {
    return emp.allocated_points > 0 ? Math.round((emp.usage_amount / emp.allocated_points) * 1000) / 10 : null;
  }

  const countryStats = useMemo(() => {
    const groups = new Map<string, SalesEmployee[]>();
    employees.forEach((emp) => {
      const key = emp.country || "미지정";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(emp);
    });
    return Array.from(groups.entries()).map(([country, emps]) => {
      const active = emps.filter((e) => e.usage_amount > 0).length;
      const usage = emps.reduce((sum, e) => sum + e.usage_amount, 0);
      const allocated = emps.reduce((sum, e) => sum + e.allocated_points, 0);
      return {
        country,
        count: emps.length,
        active,
        rate: allocated > 0 ? Math.round((usage / allocated) * 1000) / 10 : 0,
      };
    });
  }, [employees]);

  return (
    <Card>
      <SectionTitle
        title={`${client.name}의 임직원 포인트 사용 현황`}
        subtitle="임직원 개인별 포인트 사용 금액을 국가·부서별로 기록합니다."
      />

      <div className="mb-4 flex flex-wrap items-end gap-2 rounded-lg border border-dashed border-[var(--border)] p-3">
        <input
          className={`${inputClass} w-32`}
          placeholder="사번"
          value={employeeCode}
          onChange={(e) => setEmployeeCode(e.target.value)}
        />
        <input
          className={`${inputClass} w-32`}
          placeholder="부서"
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
        />
        <input
          className={`${inputClass} w-28`}
          placeholder="국가"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <input
          className={`${inputClass} w-28`}
          placeholder="분기 (예: 2026-Q2)"
          value={quarter}
          onChange={(e) => setQuarter(e.target.value)}
        />
        <input
          className={`${inputClass} w-32`}
          placeholder="사용금액(원)"
          type="number"
          value={usageAmount}
          onChange={(e) => setUsageAmount(e.target.value)}
        />
        <input
          className={`${inputClass} w-32`}
          placeholder="지급 포인트(원)"
          type="number"
          value={allocatedPoints}
          onChange={(e) => setAllocatedPoints(e.target.value)}
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
      ) : employees.length === 0 ? (
        <EmptyNotice>등록된 임직원 데이터가 없습니다.</EmptyNotice>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            <div className="rounded-lg bg-[var(--canvas)] p-3">
              <p className="text-[var(--muted)]">전체 인원</p>
              <p className="text-lg font-bold text-[var(--ink)]">{employees.length}명</p>
            </div>
            <div className="rounded-lg bg-[var(--canvas)] p-3">
              <p className="text-[var(--muted)]">활성 인원 (사용액&gt;0)</p>
              <p className="text-lg font-bold text-[var(--positive)]">
                {activeCount}명 ({Math.round((activeCount / employees.length) * 1000) / 10}%)
              </p>
            </div>
            <div className="rounded-lg bg-[var(--canvas)] p-3">
              <p className="text-[var(--muted)]">1인당 평균 사용액</p>
              <p className="text-lg font-bold text-[var(--ink)]">{avgUsage.toLocaleString()}원</p>
            </div>
            <div className="rounded-lg bg-[var(--canvas)] p-3">
              <p className="text-[var(--muted)]">지급 포인트 대비 사용률</p>
              <p className="text-lg font-bold text-[var(--brand-hover)]">{avgUsageRate}%</p>
            </div>
          </div>

          <p className="mb-2 text-sm font-semibold text-[var(--ink)]">국가별 요약</p>
          <div className="mb-6 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="text-[var(--muted)]">
                <tr>
                  <th className="pb-2 pr-4">국가</th>
                  <th className="pb-2 pr-4">인원</th>
                  <th className="pb-2 pr-4">활성 인원</th>
                  <th className="pb-2 pr-4">사용률</th>
                </tr>
              </thead>
              <tbody>
                {countryStats.map((s) => (
                  <tr key={s.country} className="border-t border-[var(--border)]">
                    <td className="py-2 pr-4 font-medium text-[var(--ink)]">{s.country}</td>
                    <td className="py-2 pr-4">{s.count}명</td>
                    <td className="py-2 pr-4">{s.active}명</td>
                    <td className="py-2 pr-4 font-semibold text-[var(--brand-hover)]">{s.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="max-h-[420px] overflow-y-auto overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead className="sticky top-0 bg-[var(--surface)] text-[var(--muted)]">
                <tr>
                  <th className="pb-2 pr-4">사번</th>
                  <th className="pb-2 pr-4">부서</th>
                  <th className="pb-2 pr-4">국가</th>
                  <th className="pb-2 pr-4">분기</th>
                  <th className="pb-2 pr-4">지급 포인트</th>
                  <th className="pb-2 pr-4">사용금액</th>
                  <th className="pb-2 pr-4">사용률</th>
                  <th className="pb-2 pr-4">상태</th>
                  <th className="pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => {
                  const rate = usageRate(emp);
                  return (
                    <tr key={emp.id} className="border-t border-[var(--border)]">
                      <td className="py-2 pr-4 font-medium text-[var(--ink)]">{emp.employee_code}</td>
                      <td className="py-2 pr-4">{emp.department || "-"}</td>
                      <td className="py-2 pr-4">{emp.country || "-"}</td>
                      <td className="py-2 pr-4">{emp.quarter}</td>
                      <td className="py-2 pr-4">{emp.allocated_points.toLocaleString()}원</td>
                      <td className="py-2 pr-4">{emp.usage_amount.toLocaleString()}원</td>
                      <td className="py-2 pr-4 font-semibold text-[var(--brand-hover)]">
                        {rate !== null ? `${rate}%` : "-"}
                      </td>
                      <td className="py-2 pr-4">
                        <Badge tone={emp.usage_amount > 0 ? "positive" : "default"}>
                          {emp.usage_amount > 0 ? "활성" : "미사용"}
                        </Badge>
                      </td>
                      <td className="py-2">
                        <button onClick={() => handleDelete(emp.id)} className="text-xs text-[var(--negative)] underline">
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}
