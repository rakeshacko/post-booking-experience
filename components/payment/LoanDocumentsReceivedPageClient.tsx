"use client";

import { useSearchParams } from "next/navigation";

import { KycDocumentsReceivedScreen } from "@/components/kyc/KycDocumentsReceivedScreen";

/**
 * Preserves `bank` query into loan processing on auto-advance when present.
 */
export function LoanDocumentsReceivedPageClient() {
  const searchParams = useSearchParams();
  const bank = searchParams.get("bank");
  const okayHref =
    bank != null && bank.length > 0
      ? `/payment/loan-processing?bank=${encodeURIComponent(bank)}`
      : "/payment/loan-processing";

  return <KycDocumentsReceivedScreen okayHref={okayHref} />;
}
