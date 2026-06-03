"use client";

import { LOAN_APPLICATION_CONTROL_TEXT_CLASS } from "@/components/payment/loan-application/loan-application-layout";

type LoanApplicationSegmentChipProps = {
  label: string;
  selected: boolean;
  onClick: () => void;
  /** Employment chips are 48px; tenure chips are 40px. */
  size?: "employment" | "tenure";
  className?: string;
};

export function LoanApplicationSegmentChip({
  label,
  selected,
  onClick,
  size = "employment",
  className = "",
}: LoanApplicationSegmentChipProps) {
  const heightClass = size === "employment" ? "h-12" : "h-10";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`${heightClass} rounded-lg border ${LOAN_APPLICATION_CONTROL_TEXT_CLASS} transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2 ${
        selected
          ? "border-[#121212] bg-[#121212]/10 font-medium text-[#040222]"
          : "border-[#e8e8e8] bg-white font-normal text-[#040222] hover:bg-[#fafafa]"
      } ${className}`}
    >
      {label}
    </button>
  );
}
