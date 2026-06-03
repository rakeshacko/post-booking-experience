"use client";

import type { ReactNode } from "react";

import { LoanApplicationPageStagger } from "@/components/payment/loan-application/LoanApplicationPageStagger";

type LoanApplicationFixedCtaProps = {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  children?: ReactNode;
  /** When set, CTA fades in after main content (ms). Omit to show immediately. */
  staggerDelayMs?: number;
};

export function LoanApplicationFixedCta({
  label,
  onClick,
  disabled = false,
  children,
  staggerDelayMs,
}: LoanApplicationFixedCtaProps) {
  const inner = (
    <div className="mx-auto w-full max-w-[640px] space-y-3">
      {children}
      <button
          type="button"
          disabled={disabled}
          onClick={onClick}
          className="primary-cta w-full focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#a0a0a0] disabled:opacity-100"
        >
          {label}
        </button>
    </div>
  );

  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-4px_8px_-2px_rgba(54,53,76,0.06)]">
      {staggerDelayMs != null ? (
        <LoanApplicationPageStagger delayMs={staggerDelayMs}>{inner}</LoanApplicationPageStagger>
      ) : (
        inner
      )}
    </div>
  );
}
