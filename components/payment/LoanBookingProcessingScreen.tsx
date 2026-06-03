"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { bankForQueryParam } from "@/components/payment/acko-drive-finance-bank";
import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";

const LOAN_PROCESSING_HEADLINE = "We're processing your loan application, Sharath!";

const LOAN_PROCESSING_INFO_BODY =
  "A bank representative will call you to verify a few details. Share the OTP when asked.";

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
  const bankId = searchParams.get("bank");
  const bank = useMemo(() => bankForQueryParam(bankId), [bankId]);
  const nextHref = loanSanctionedHref(bankId);
  const subline = useMemo(
    () =>
      `${bank.name} will review your application. This usually takes 2-3 business days. We will reach out once your loan is approved.`,
    [bank.name],
  );

  return (
    <KycBookingProcessingScreen
      headline={LOAN_PROCESSING_HEADLINE}
      subline={subline}
      infoBox={{ body: LOAN_PROCESSING_INFO_BODY }}
      heroIllustrationSrc={KYC_ASSETS.loanProcessingHero}
      nextHref={nextHref}
      prefetchHref={nextHref}
      whatsNextCard={<LoanProcessingWhatsNext />}
      manageBookingShowVehicleIdentification
    />
  );
}
