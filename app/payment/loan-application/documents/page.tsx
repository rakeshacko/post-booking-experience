import { Suspense } from "react";

import { LoanApplicationDocumentsScreen } from "@/components/payment/loan-application/LoanApplicationDocumentsScreen";

export default function LoanApplicationDocumentsPage() {
  return (
    <Suspense fallback={null}>
      <LoanApplicationDocumentsScreen />
    </Suspense>
  );
}
