"use client";

import { BUYING_GUIDE_STEP_COUNT } from "@/components/kyc/buying-guide-content";

type BuyingGuideProgressProps = {
  currentStep: number;
};

/**
 * Header progress track — fill updates instantly when `currentStep` changes.
 */
export function BuyingGuideProgress({ currentStep }: BuyingGuideProgressProps) {
  const progressPercent = (currentStep / BUYING_GUIDE_STEP_COUNT) * 100;

  return (
    <div
      className="h-1.5 w-full min-w-0 flex-1 overflow-hidden rounded-2xl bg-[#f5f5f5]"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={BUYING_GUIDE_STEP_COUNT}
      aria-valuenow={currentStep}
      aria-label={`Step ${currentStep} of ${BUYING_GUIDE_STEP_COUNT}`}
    >
      <div
        className="h-full rounded-2xl bg-[linear-gradient(90deg,#121212_0%,#787878_100%)]"
        style={{ width: `${progressPercent}%` }}
      />
    </div>
  );
}
