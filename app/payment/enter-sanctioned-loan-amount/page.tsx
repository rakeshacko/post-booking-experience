import { Suspense } from "react";

import { EnterSanctionedLoanAmountScreen } from "@/components/payment/EnterSanctionedLoanAmountScreen";

/**
 * Self finance — enter bank-sanctioned loan amount; derived down payment matches choose-loan-amount demo model.
 */
export default function EnterSanctionedLoanAmountPage() {
  return (
    <Suspense fallback={null}>
      <EnterSanctionedLoanAmountScreen />
    </Suspense>
  );
}
