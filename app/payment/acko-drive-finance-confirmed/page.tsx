import { Suspense } from "react";

import { AckoDriveFinanceConfirmedScreen } from "@/components/payment/AckoDriveFinanceConfirmedScreen";
import { CelebrationPageTransition } from "@/components/ui/page-transition";

/**
 * ACKO Drive — banking partner chosen; success celebration (aligned with KYC booking confirmed).
 */
export default function AckoDriveFinanceConfirmedPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#fafbfb]" aria-hidden />}>
      <CelebrationPageTransition>
        <AckoDriveFinanceConfirmedScreen />
      </CelebrationPageTransition>
    </Suspense>
  );
}
