"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, ErrorNotice, PrimaryButton } from "@/components/ui";

function LoginForm() {
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "로그인에 실패했습니다.");
        return;
      }
      const next = searchParams.get("next") || "/";
      // 로그인 직후에는 클라이언트 라우터 캐시가 이전(비로그인) 응답을 들고 있을 수 있어
      // 완전한 페이지 이동으로 서버에 새 쿠키를 확실히 반영시킨다.
      window.location.href = next;
    } catch {
      setError("요청을 보내지 못했습니다. 네트워크 상태를 확인해주세요.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-20 max-w-sm">
      <Card>
        <h1 className="text-lg font-bold text-[var(--ink)]">선물 트렌드 분석</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">감동타임 운영팀 전용 내부 도구입니다. 비밀번호를 입력해주세요.</p>
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            autoFocus
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
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
