"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { bankForQueryParam } from "@/components/payment/acko-drive-finance-bank";
import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { DEMO_SANCTIONED_LOAN_MAX_INR } from "@/components/payment/loan-amount-demo-constants";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { SanctionedAmountSummaryCard } from "@/components/payment/SanctionedAmountSummaryCard";

const LOAN_SANCTIONED_HEADLINE = "Your loan is approved, Sharath!";

const LOAN_SANCTIONED_SUBLINE =
  "Select how much you need and we will calculate your down payment.";

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
  const bankId = searchParams.get("bank");
  const bank = useMemo(() => bankForQueryParam(bankId), [bankId]);
  const nextHref = chooseLoanAmountHref(bankId);

  const heroSummaryCard = useMemo(
    () => (
      <SanctionedAmountSummaryCard
        sanctionedAmountInr={DEMO_SANCTIONED_LOAN_MAX_INR}
        bankName={bank.name}
      />
    ),
    [bank.name],
  );

  return (
    <KycBookingProcessingScreen
      headline={LOAN_SANCTIONED_HEADLINE}
      subline={LOAN_SANCTIONED_SUBLINE}
      heroSummaryCard={heroSummaryCard}
      heroIllustrationSrc={KYC_ASSETS.loanApprovedHero}
      nextHref={nextHref}
      prefetchHref={nextHref}
      nextCtaLabel="Select your loan amount"
      whatsNextCard={<LoanProcessingWhatsNext variant="sanctioned" />}
    />
  );
}
