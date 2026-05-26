import { Suspense } from "react";

import { KycBookingConfirmedPageClient } from "@/components/kyc/KycBookingConfirmedPageClient";
import { CelebrationPageTransition } from "@/components/ui/page-transition";

/**
 * KYC — booking confirmed success (Figma node 1880:7088).
 * `?source=payment` — booking-lock payment success copy after checkout.
 */
export default function KycBookingConfirmedPage() {
  return (
    <CelebrationPageTransition>
      <Suspense fallback={null}>
        <KycBookingConfirmedPageClient />
      </Suspense>
    </CelebrationPageTransition>
  );
}
