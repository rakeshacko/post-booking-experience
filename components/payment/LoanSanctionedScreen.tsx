"use client";

import { useSearchParams } from "next/navigation";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";

const LOAN_SANCTIONED_HEADLINE = "Your loan is approved, Sharath!";

const LOAN_SANCTIONED_SUBLINE =
  "Your loan has been processed successfully. Choose your loan amount on the next screen so we can show your down payment and what happens next.";

function chooseLoanAmountHref(bank: string | null) {
  return bank
    ? `/payment/choose-loan-amount?bank=${encodeURIComponent(bank)}`
    : "/payment/choose-loan-amount";
}

/**
 * Loan sanctioned — replica of loan processing UI; primary CTA continues to choose loan amount.
 */
export function LoanSanctionedScreen() {
  const searchParams = useSearchParams();
  const bank = searchParams.get("bank");
  const nextHref = chooseLoanAmountHref(bank);

  return (
    <KycBookingProcessingScreen
      headline={LOAN_SANCTIONED_HEADLINE}
      subline={LOAN_SANCTIONED_SUBLINE}
      heroIllustrationSrc={KYC_ASSETS.loanApprovedHero}
      nextHref={nextHref}
      prefetchHref={nextHref}
      nextCtaLabel="Choose loan amount"
      whatsNextCard={<LoanProcessingWhatsNext variant="sanctioned" />}
    />
  );
}
