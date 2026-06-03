"use client";

import { BUYING_GUIDE_STEP_COUNT } from "@/components/kyc/buying-guide-content";

const SEGMENT_FILL_CLASS =
  "h-full w-full rounded-2xl bg-[linear-gradient(90deg,#121212_0%,#787878_100%)]";

type BuyingGuideProgressProps = {
  currentStep: number;
};

/**
 * Header progress — four segments with 8px gaps; each fills when its step is reached.
 */
export function BuyingGuideProgress({ currentStep }: BuyingGuideProgressProps) {
  return (
    <div
      className="flex h-1 w-full min-w-0 flex-1 items-center gap-2"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={BUYING_GUIDE_STEP_COUNT}
      aria-valuenow={currentStep}
      aria-label={`Step ${currentStep} of ${BUYING_GUIDE_STEP_COUNT}`}
    >
      {Array.from({ length: BUYING_GUIDE_STEP_COUNT }, (_, index) => {
        const segmentStep = index + 1;
        const filled = segmentStep <= currentStep;

        return (
          <div
            key={segmentStep}
            className="h-full min-w-0 flex-1 overflow-hidden rounded-2xl bg-[#f5f5f5]"
            aria-hidden
          >
            {filled ? <div className={SEGMENT_FILL_CLASS} /> : null}
          </div>
        );
      })}
    </div>
  );
}
