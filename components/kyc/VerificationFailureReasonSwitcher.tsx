"use client";

import {
  KYC_VERIFICATION_FAILURE_REASONS,
  KYC_VERIFICATION_FAILED_VARIANTS,
  type KycVerificationFailureReason,
} from "@/components/kyc/kyc-verification-failed-content";

type VerificationFailureReasonSwitcherProps = {
  value: KycVerificationFailureReason;
  onChange: (reason: KycVerificationFailureReason) => void;
};

/**
 * Demo / QA control — preview the three verification failure messages on one screen.
 */
export function VerificationFailureReasonSwitcher({
  value,
  onChange,
}: VerificationFailureReasonSwitcherProps) {
  return (
    <div
      className="flex w-full gap-1 rounded-full border border-[#e8e8e8] bg-[#f5f5f5] p-1"
      role="tablist"
      aria-label="Verification failure reason"
    >
      {KYC_VERIFICATION_FAILURE_REASONS.map((id) => {
        const selected = value === id;
        const { label } = KYC_VERIFICATION_FAILED_VARIANTS[id];
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(id)}
            className={`min-w-0 flex-1 rounded-full px-2 py-2 text-center text-[11px] font-medium leading-[14px] transition-colors focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-1 ${
              selected
                ? "bg-white text-[#121212] shadow-sm"
                : "text-[#6b7280] hover:text-[#121212]"
            }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
