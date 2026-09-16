"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

type NavChild = { href: string; label: string; match: (pathname: string, tab: string | null) => boolean };
type NavGroup = { label: string; icon: (props: { className?: string }) => ReactNode; children: NavChild[] };

const NAV_GROUPS: NavGroup[] = [
  {
    label: "트렌드 선물 제안",
    icon: IconGift,
    children: [
      { href: "/research", label: "트렌드 리서치", match: (p) => p === "/research" },
      { href: "/survey", label: "설문 분석", match: (p) => p === "/survey" },
      { href: "/recommend", label: "매칭 추천", match: (p) => p === "/recommend" },
    ],
  },
  {
    label: "영업 관리",
    icon: IconBriefcase,
    children: [
      { href: "/sales?tab=affiliates", label: "계열사 확산", match: (p, tab) => p === "/sales" && (tab === null || tab === "affiliates") },
      { href: "/sales?tab=activation", label: "활성률 리포트", match: (p, tab) => p === "/sales" && tab === "activation" },
      { href: "/sales?tab=employees", label: "임직원 사용 현황", match: (p, tab) => p === "/sales" && tab === "employees" },
    ],
  },
];

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
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-7 w-7 flex-none items-center justify-center rounded-md bg-white/15">
        <IconGift className="h-4 w-4 text-white" />
      </span>
      <span className="text-[15px] font-bold tracking-tight text-white">이트너스</span>
    </Link>
  );
}

export function SidebarNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  return (
    <aside className="sticky top-0 hidden h-screen w-60 flex-none flex-col border-r border-[var(--border)] bg-[var(--surface)] md:flex">
      <div className="flex h-16 flex-none items-center bg-[var(--brand)] px-5">
        <Logo />
      </div>
      <nav className="flex flex-1 flex-col gap-4 px-3 py-5">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="flex items-center gap-2 px-3 pb-2 text-[15px] font-extrabold tracking-tight text-[var(--ink)]">
              <group.icon className="h-4 w-4 flex-none text-[var(--brand)]" />
              {group.label}
            </div>
            <div className="flex flex-col gap-1">
              {group.children.map((child) => (
                <NavLink key={child.href} href={child.href} active={child.match(pathname, tab)}>
                  {child.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
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
      {children}
    </Link>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab");
  return (
    <header className="flex flex-col border-b border-[var(--border)] bg-[var(--surface)] md:hidden">
      <div className="flex h-14 items-center bg-[var(--brand)] px-4">
        <Logo />
      </div>
      <nav className="flex gap-1 overflow-x-auto px-3 py-2">
        {NAV_GROUPS.flatMap((group) => group.children).map((child) => {
          const active = child.match(pathname, tab);
          return (
            <Link
              key={child.href}
              href={child.href}
              className={`flex-none rounded-md px-3 py-1.5 text-[13px] font-medium ${
                active ? "bg-[var(--brand-soft)] text-[var(--brand-hover)]" : "text-[var(--muted)]"
              }`}
            >
              {child.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
