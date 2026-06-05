"use client";

import { useEffect, useState } from "react";

import { KycVerificationInProgressScreen } from "@/components/kyc/KycVerificationInProgressScreen";
import { isCancelNoChargesFlow } from "@/lib/experience-flow";
import { getKycVerificationNextHref } from "@/lib/kyc-verification-outcome";

/** Resolves Express vs verification-failed fork for the Next CTA. */
export function KycVerificationInProgressPageClient() {
  const [hideDemoCta, setHideDemoCta] = useState(false);

  useEffect(() => {
    setHideDemoCta(isCancelNoChargesFlow());
  }, []);

  return (
    <KycVerificationInProgressScreen
      nextHref={getKycVerificationNextHref()}
      hideDemoCta={hideDemoCta}
    />
  );
}
