"use client";

import { Suspense } from "react";

import { KycVerificationFailedPageClient } from "@/components/kyc/KycVerificationFailedPageClient";
import { ModifyNoChargesGatedPage } from "@/components/kyc/ModifyNoChargesGatedPage";

/**
 * Verification failed — unhappy path after `/kyc/verification-in-progress`
 * when the quote flow switch is set to verification failed.
 * Second failure shows booking cancelled + refund (demo).
 */
export default function KycVerificationFailedPage() {
  return (
    <ModifyNoChargesGatedPage>
      <Suspense fallback={null}>
        <KycVerificationFailedPageClient />
      </Suspense>
    </ModifyNoChargesGatedPage>
  );
}
