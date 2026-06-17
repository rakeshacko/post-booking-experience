import { Suspense } from "react";

import { LoanAgreementScreen } from "@/components/payment/LoanAgreementScreen";

/**
 * Digital loan-agreement signing — between the locked loan confirmation and the
 * down payment. Replaces the rep-collected physical signature.
 */
export default function LoanAgreementPage() {
  return (
    <Suspense fallback={null}>
      <LoanAgreementScreen />
    </Suspense>
  );
}
