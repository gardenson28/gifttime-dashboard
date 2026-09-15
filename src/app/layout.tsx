import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { StoreProvider } from "@/lib/store";

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

const NAV_ITEMS = [
  { href: "/", label: "홈" },
  { href: "/research", label: "트렌드 리서치" },
  { href: "/survey", label: "설문 분석" },
];

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <StoreProvider>
          <header className="border-b border-slate-200 bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3">
              <Link href="/" className="flex items-center gap-2 font-bold text-slate-800">
                <span className="text-lg">🎁</span>
                <span>선물 트렌드 분석</span>
              </Link>
              <nav className="flex gap-1 text-sm">
                {NAV_ITEMS.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-md px-3 py-1.5 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </header>
          <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">{children}</main>
          <footer className="border-t border-slate-200 py-4 text-center text-xs text-slate-400">
            선물 트렌드 분석 · 포트폴리오 데모 프로젝트 (가상 데이터 사용)
          </footer>
        </StoreProvider>
      </body>
    </html>
  );
}
