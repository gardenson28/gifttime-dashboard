import type { Metadata } from "next";
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
  title: "선물 트렌드 분석",
  description: "시즌·이벤트 기반 기업 선물 트렌드 리서치 및 임직원 선호도 분석 대시보드",
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
            <SidebarNav />
            <div className="flex min-h-screen flex-1 flex-col">
              <MobileNav />
              <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-10 md:py-10">
                {children}
              </main>
              <footer className="border-t border-[var(--border)] py-4 text-center text-xs text-[var(--faint)]">
                선물 트렌드 분석 · 포트폴리오 데모 프로젝트 (가상 데이터 사용)
              </footer>
            </div>
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
