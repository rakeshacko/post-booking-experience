import { Suspense } from "react";

import { AckoDriveFinanceActionScreen } from "@/components/payment/AckoDriveFinanceActionScreen";

/**
 * ACKO Drive finance — loan application action step after banking partner confirmation.
 */
export default function AckoDriveFinanceActionPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#f1f0f5]" aria-hidden />}>
      <AckoDriveFinanceActionScreen />
    </Suspense>
  );
}
