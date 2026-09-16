"use client";

import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { Card, ErrorNotice, PrimaryButton } from "@/components/ui";

export function AuthGate({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "로그인에 실패했습니다.");
        return;
      }
      setUnlocked(true);
    } catch {
      setError("요청을 보내지 못했습니다. 네트워크 상태를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  }

  if (unlocked) return <>{children}</>;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--canvas)] px-4">
      <div className="w-full max-w-sm">
        <Card>
          <h1 className="text-lg font-bold text-[var(--ink)]">이트너스</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">이트너스 전용 내부 도구입니다. 사번과 비밀번호를 입력해주세요.</p>
          <form onSubmit={handleSubmit} className="mt-5 space-y-3">
            <input
              type="text"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              placeholder="사번"
              autoFocus
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="w-full rounded-lg border border-[var(--border)] px-3 py-2 text-sm outline-none transition focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand-soft)]"
            />
            <PrimaryButton type="submit" disabled={loading} className="w-full">
              {loading ? "확인 중..." : "입장하기"}
            </PrimaryButton>
          </form>
          {error && (
            <div className="mt-3">
              <ErrorNotice>{error}</ErrorNotice>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
