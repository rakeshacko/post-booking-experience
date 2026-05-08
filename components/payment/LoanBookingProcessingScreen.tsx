"use client";

import { useSearchParams } from "next/navigation";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";

const LOAN_PROCESSING_HEADLINE = "We're processing your loan application, Sharath!";

const LOAN_PROCESSING_SUBLINE =
  "You're all set for now. A bank representative will call to verify a few details — just pick up and share the OTP when asked.";

function loanSanctionedHref(bank: string | null) {
  return bank
    ? `/payment/loan-sanctioned?bank=${encodeURIComponent(bank)}`
    : "/payment/loan-sanctioned";
}

/**
 * Loan document flow — same layout as KYC booking processing (`/kyc/processing`).
 * “Next” goes to `/payment/loan-sanctioned` (preserves `?bank=` when present).
 */
export function LoanBookingProcessingScreen() {
  const searchParams = useSearchParams();
  const bank = searchParams.get("bank");
  const nextHref = loanSanctionedHref(bank);

  return (
    <KycBookingProcessingScreen
      headline={LOAN_PROCESSING_HEADLINE}
      subline={LOAN_PROCESSING_SUBLINE}
      heroIllustrationSrc={KYC_ASSETS.loanProcessingHero}
      nextHref={nextHref}
      prefetchHref={nextHref}
      whatsNextCard={<LoanProcessingWhatsNext />}
    />
  );
}
