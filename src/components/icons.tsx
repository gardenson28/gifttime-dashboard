import type { ReactElement } from "react";

type IconProps = { className?: string };

export function IconFood({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M6 3v6a2 2 0 0 0 4 0V3M8 9v8M14 3c-1.4 0-2 1.5-2 3.5S12.6 10 14 10s2-1.5 2-3.5S15.4 3 14 3Zm0 7v7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconLiving({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M3 8.5 5 4h10l2 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <rect x="3" y="8.5" width="14" height="8" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 11.5c0 1.2 1.3 2 3 2s3-.8 3-2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function IconDigital({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M4 11a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <rect x="2.5" y="11" width="3.2" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
      <rect x="14.3" y="11" width="3.2" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function IconFashion({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M7 6V5a3 3 0 0 1 6 0v1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M4.5 6h11l1 10a1 1 0 0 1-1 1.1H4.5a1 1 0 0 1-1-1.1l1-10Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
    </svg>
  );
}

export function IconStationery({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M12.5 3.5 16 7l-8.2 8.2-4 1 1-4 7.7-7.7Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M11 5 15 8.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function IconTag({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10.5 3.5H16v5.5L9 16 3 10l7-6.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="12.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

export function IconUpload({ className }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className}>
      <path d="M10 13V4m0 0 3 3m-3-3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 13v2a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export const CATEGORY_ICON_COMPONENT: Record<string, (props: IconProps) => ReactElement> = {
  식품: IconFood,
  생활용품: IconLiving,
  디지털: IconDigital,
  패션: IconFashion,
  문구: IconStationery,
  기타: IconTag,
};
