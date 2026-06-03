import { Suspense } from "react";

import { LoanApplicationAddressScreen } from "@/components/payment/loan-application/LoanApplicationAddressScreen";

export default function LoanApplicationAddressPage() {
  return (
    <Suspense fallback={null}>
      <LoanApplicationAddressScreen />
    </Suspense>
  );
}
