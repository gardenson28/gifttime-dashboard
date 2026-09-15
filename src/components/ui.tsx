import type { ReactNode } from "react";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-[15px] font-bold text-[var(--ink)]">{title}</h2>
      {subtitle && <p className="mt-1 text-[13px] text-[var(--muted)]">{subtitle}</p>}
    </div>
  );
}

export function PrimaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded-lg bg-[var(--brand)] px-4 py-2 text-[13.5px] font-semibold text-white transition hover:bg-[var(--brand-hover)] disabled:cursor-not-allowed disabled:bg-[var(--faint)] ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({
  children,
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`rounded-lg border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-[13.5px] font-semibold text-[var(--ink)] transition hover:bg-[var(--canvas)] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "brand" | "positive" | "negative";
}) {
  const toneClasses: Record<string, string> = {
    default: "bg-[var(--canvas)] text-[var(--muted)]",
    brand: "bg-[var(--brand-soft)] text-[var(--brand-hover)]",
    positive: "bg-[var(--positive-soft)] text-[var(--positive)]",
    negative: "bg-[var(--negative-soft)] text-[var(--negative)]",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

export function EmptyNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--canvas)] p-4 text-[13.5px] text-[var(--muted)]">
      {children}
    </div>
  );
}

export function ErrorNotice({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-[var(--negative-soft)] bg-[var(--negative-soft)] p-4 text-[13.5px] text-[var(--negative)]">
      {children}
    </div>
  );
}
