import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type ShimmerInfoIcon = "alert" | "clock";

const ICON_PATHS: Record<ShimmerInfoIcon, ReactNode> = {
  alert: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
      <path d="M12 7.5V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="16.4" r="1.2" fill="currentColor" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2" />
      <path
        d="M12 7.5V12l3 2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </>
  ),
};

export type ShimmerInfoCardProps = {
  /** `alert` for caveats/checks, `clock` for deadlines/expectations. */
  icon?: ShimmerInfoIcon;
  /** Bold scent-word prefix, e.g. “Quick check:”. */
  lead?: string;
  children: ReactNode;
  className?: string;
};

/**
 * The app's highlighted-info style: amber outline, soft yellow-to-transparent
 * gradient, shimmer sweep. Use wherever a line of info must not be missed
 * (caveats, deadlines, stakes).
 */
export function ShimmerInfoCard({ icon = "alert", lead, children, className }: ShimmerInfoCardProps) {
  return (
    <div
      className={cn(
        "next-step-shimmer flex items-start gap-2.5 rounded-xl border border-[#f3e0b6] bg-[linear-gradient(to_bottom,#fff7e5,rgba(255,247,229,0))] px-3.5 py-2.5",
        className
      )}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden
        className="mt-px shrink-0 text-[#a76406]"
      >
        {ICON_PATHS[icon]}
      </svg>
      <p className="text-xs leading-[18px] text-[#7a5410]">
        {lead ? <span className="font-semibold">{lead} </span> : null}
        {children}
      </p>
    </div>
  );
}
