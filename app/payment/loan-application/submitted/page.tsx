import { Suspense } from "react";

import { LoanApplicationSubmittedSuccessScreen } from "@/components/payment/loan-application/LoanApplicationSubmittedSuccessScreen";
import { CelebrationPageTransition } from "@/components/ui/page-transition";

export default function LoanApplicationSubmittedPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#f1f0f5]" aria-hidden />}>
      <CelebrationPageTransition>
        <LoanApplicationSubmittedSuccessScreen />
      </CelebrationPageTransition>
    </Suspense>
  );
}
