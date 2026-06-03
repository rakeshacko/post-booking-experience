"use client";

import { KycVerificationInProgressScreen } from "@/components/kyc/KycVerificationInProgressScreen";
import { getKycVerificationNextHref } from "@/lib/kyc-verification-outcome";

/** Resolves Express vs verification-failed fork for the Next CTA. */
export function KycVerificationInProgressPageClient() {
  return <KycVerificationInProgressScreen nextHref={getKycVerificationNextHref()} />;
}
