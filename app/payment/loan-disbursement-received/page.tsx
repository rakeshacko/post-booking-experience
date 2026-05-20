import { Suspense } from "react";

import { LoanDisbursementReceivedScreen } from "@/components/payment/LoanDisbursementReceivedScreen";
import { FadePageTransition } from "@/components/ui/page-transition";

/**
 * Loan disbursement success — between down-payment setup and car insurance prep.
 * Fade entry (no slide-from-bottom) so the hero Lottie stays visually stable.
 */
export default function LoanDisbursementReceivedPage() {
  return (
    <FadePageTransition>
      <Suspense fallback={null}>
        <LoanDisbursementReceivedScreen />
      </Suspense>
    </FadePageTransition>
  );
}
