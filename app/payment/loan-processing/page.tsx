import { Suspense } from "react";

import { LoanBookingProcessingScreen } from "@/components/payment/LoanBookingProcessingScreen";

/**
 * Loan application — post-documents processing (layout aligned with `/kyc/processing`).
 */
export default function LoanProcessingPage() {
  return (
    <Suspense fallback={null}>
      <LoanBookingProcessingScreen />
    </Suspense>
  );
}
