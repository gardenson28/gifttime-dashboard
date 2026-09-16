import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { SidebarNav, MobileNav } from "@/components/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "이트너스",
  description: "시즌·이벤트 기반 기업 선물 트렌드 제안과 계열사 확산·활성률 중심의 영업 관리를 지원하는 내부 대시보드",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full text-[var(--ink)]">
        <StoreProvider>
          <div className="flex min-h-screen">
            <Suspense fallback={null}>
              <SidebarNav />
            </Suspense>
            <div className="flex min-h-screen flex-1 flex-col">
              <Suspense fallback={null}>
                <MobileNav />
              </Suspense>
              <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-10 md:py-10">
                {children}
              </main>
              <footer className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--faint)]">
                이트너스 · 포트폴리오 데모 프로젝트 (가상 데이터 사용)
              </footer>
            </div>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
