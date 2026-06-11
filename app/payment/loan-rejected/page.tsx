import { Suspense } from "react";

import { LoanRejectedScreen } from "@/components/payment/LoanRejectedScreen";
import { FadePageTransition } from "@/components/ui/page-transition";

/**
 * Bank declined the loan — demo branch off `/payment/loan-processing`.
 * Shivi flips the application to a pre-approved alternative; nothing restarts.
 */
export default function LoanRejectedPage() {
  return (
    <FadePageTransition>
      <Suspense fallback={null}>
        <LoanRejectedScreen />
      </Suspense>
    </FadePageTransition>
  );
}
