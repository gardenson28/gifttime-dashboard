import Link from "next/link";
import { Badge, Card } from "@/components/ui";

const SECTIONS = [
  {
    href: "/research",
    title: "트렌드 선물 제안",
    description: "시즌·이벤트 트렌드 리서치, 임직원 설문 분석, 매칭 추천까지 고객사 제안용 선물군을 정리합니다.",
  },
  {
    href: "/sales?tab=affiliates",
    title: "영업 관리",
    description: "계열사 확산과 활성률 개선, 임직원 몰 사용 현황을 고객사별로 관리합니다.",
  },
];

export default function Home() {
  return (
    <div className="space-y-8">
      <div>
        <Badge tone="brand">이트너스 전용 내부 도구</Badge>
        <h1 className="mt-2 text-3xl font-bold text-[var(--ink)]">이트너스 대시보드</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          트렌드 선물 제안과 영업 관리 중 원하는 메뉴로 이동해주세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link key={section.href} href={section.href}>
            <Card className="h-full transition hover:border-[var(--brand)]">
              <h2 className="text-lg font-bold text-[var(--ink)]">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{section.description}</p>
              <p className="mt-4 text-sm font-semibold text-[var(--brand-hover)]">바로가기 →</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
