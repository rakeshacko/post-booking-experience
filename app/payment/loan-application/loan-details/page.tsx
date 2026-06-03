import { Suspense } from "react";

import { LoanApplicationLoanDetailsScreen } from "@/components/payment/loan-application/LoanApplicationLoanDetailsScreen";

export default function LoanApplicationLoanDetailsPage() {
  return (
    <Suspense fallback={null}>
      <LoanApplicationLoanDetailsScreen />
    </Suspense>
  );
}
