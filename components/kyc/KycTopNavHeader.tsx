"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const SCROLL_SOLID_THRESHOLD_PX = 8;

export function BackChevron() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="block h-6 w-6" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type KycTopNavHeaderProps = {
  /** Optional label after back (e.g. checkout title). */
  title?: string;
  /** Optional right-side control (e.g. “Get help” pill). */
  endSlot?: ReactNode;
  /** No solid fill — use over gradients/animations; stays above layers via z-index. */
  transparent?: boolean;
  className?: string;
};

/**
 * Sticky top bar with back control — Post-booking-experience (Figma 1890:7978):
 * 56px height, 14px left / 20px right padding, max width 640px, 24×24 chevron.
 */
export function KycTopNavHeader({
  title,
  endSlot,
  transparent = false,
  className,
}: KycTopNavHeaderProps = {}) {
  const router = useRouter();
  const [solidOnScroll, setSolidOnScroll] = useState(false);

  useEffect(() => {
    if (!transparent) {
      return;
    }
    const onScroll = () => {
      setSolidOnScroll(window.scrollY > SCROLL_SOLID_THRESHOLD_PX);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [transparent]);

  return (
    <header
      className={cn(
        "sticky top-0 mx-auto flex h-14 w-full max-w-[640px] shrink-0 items-center justify-between gap-2 pl-[14px] pr-5",
        transparent
          ? cn(
              "z-20 transition-[background-color] duration-200 ease-out",
              solidOnScroll ? "bg-white/50" : "bg-transparent"
            )
          : "z-10 bg-[#FFFFFF]",
        className
      )}
    >
      <div className="flex min-h-0 min-w-0 flex-1 items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="cta-ghost -ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[#121212] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
          aria-label="Go back"
        >
          <BackChevron />
        </button>
        {title ? (
          <h1 className="min-w-0 truncate text-base font-semibold leading-6 text-[#121212]">{title}</h1>
        ) : null}
      </div>
      {endSlot ? <div className="flex shrink-0 items-center">{endSlot}</div> : null}
    </header>
  );
}
