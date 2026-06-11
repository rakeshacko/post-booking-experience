"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useMemo, type ReactNode } from "react";

import { BuyingGuideProgress } from "@/components/kyc/BuyingGuideProgress";
import { isBuyingGuideStep } from "@/components/kyc/buying-guide-content";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
type BuyingGuideShellProps = {
  children: ReactNode;
};

/** Static chrome for all buying-guide steps — back, progress in header, step content below. */
export function BuyingGuideShell({ children }: BuyingGuideShellProps) {
  const router = useRouter();
  const params = useParams();

  const currentStep = useMemo(() => {
    const stepNumber = Number(params.step);
    return isBuyingGuideStep(stepNumber) ? stepNumber : 1;
  }, [params.step]);

  /** Pop history — forward steps use `push`, so `back` matches Next without duplicating entries. */
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  return (
    <div className="relative flex h-dvh flex-col overflow-hidden bg-[#f1f0f5] font-sans">
      <KycTopNavHeader
        onBack={handleBack}
        afterBack={<BuyingGuideProgress currentStep={currentStep} />}
      />
      {children}
    </div>
  );
}
