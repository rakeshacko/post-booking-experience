import { Suspense } from "react";

import { LoanApplicationSubmittedSuccessScreen } from "@/components/payment/loan-application/LoanApplicationSubmittedSuccessScreen";
import { CelebrationPageTransition } from "@/components/ui/page-transition";

export default function LoanApplicationSubmittedPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#fafbfb]" aria-hidden />}>
      <CelebrationPageTransition>
        <LoanApplicationSubmittedSuccessScreen />
      </CelebrationPageTransition>
    </Suspense>
  );
}
