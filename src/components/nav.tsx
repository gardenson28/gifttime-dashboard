"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const NAV_ITEMS = [
  { href: "/", label: "홈", icon: IconHome },
  { href: "/research", label: "트렌드 리서치", icon: IconTrend },
  { href: "/survey", label: "설문 분석", icon: IconSurvey },
  { href: "/sales", label: "영업 관리", icon: IconBriefcase },
];

function IconHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path
        d="M3 9.5 10 4l7 5.5V16a1 1 0 0 1-1 1h-3.5a.5.5 0 0 1-.5-.5V13a2 2 0 0 0-4 0v3.5a.5.5 0 0 1-.5.5H4a1 1 0 0 1-1-1V9.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconTrend({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M3 16.5V11m5 5.5V7m5 9.5v-6m5 6V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconSurvey({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="4" y="3" width="12" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7.5h6M7 10.5h6M7 13.5h3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconBriefcase({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="2.5" y="6.5" width="15" height="9.5" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 5v1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M2.5 10.5h15" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function IconGift({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <rect x="3" y="8.5" width="14" height="8" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 11.5h14M10 8.5V17" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M10 8.5c0-1.6-1.1-3-2.6-3-1 0-1.9.7-1.9 1.6 0 1 .9 1.4 1.6 1.4H10Zm0 0c0-1.6 1.1-3 2.6-3 1 0 1.9.7 1.9 1.6 0 1-.9 1.4-1.6 1.4H10Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Logo() {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-white/15">
        <IconGift className="h-4 w-4 text-white" />
      </span>
      <span className="text-[15px] font-bold tracking-tight text-white">선물 트렌드 분석</span>
    </div>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 hidden h-screen w-60 flex-none flex-col border-r border-[var(--border)] bg-[var(--surface)] md:flex">
      <div className="flex h-16 flex-none items-center bg-[var(--brand)] px-5">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <NavLink key={item.href} href={item.href} active={active} icon={item.icon}>
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="px-5 pb-5 text-[11px] leading-relaxed text-[var(--faint)]">
        가상 데이터 기반 포트폴리오 데모입니다.
      </div>
    </aside>
  );
}

function NavLink({
  href,
  active,
  icon: Icon,
  children,
}: {
  href: string;
  active: boolean;
  icon: (props: { className?: string }) => ReactNode;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
        active
          ? "bg-[var(--brand-soft)] text-[var(--brand-hover)]"
          : "text-[var(--muted)] hover:bg-[var(--canvas)] hover:text-[var(--ink)]"
      }`}
    >
      {active && <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-full bg-[var(--brand)]" />}
      <Icon className="h-[18px] w-[18px] flex-none" />
      {children}
    </Link>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <header className="flex flex-col border-b border-[var(--border)] bg-[var(--surface)] md:hidden">
      <div className="flex h-14 items-center bg-[var(--brand)] px-4">
        <Logo />
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 py-2">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-none rounded-md px-3 py-1.5 text-[13px] font-medium ${
                active ? "bg-[var(--brand-soft)] text-[var(--brand-hover)]" : "text-[var(--muted)]"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
