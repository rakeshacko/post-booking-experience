"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { useFullPaymentJourney } from "@/components/payment/use-full-payment-journey";
import { buildLoanDisbursementReceivedHref, buildPayInsurancePremiumHref } from "@/lib/paymentUrls";

const LOAN_HEADLINE = "Down payment received";
const LOAN_BANK_TRANSFER_HEADLINE = "Payment received";
const LOAN_SUBLINE =
  "Your loan disbursement to the dealer is being processed. This usually takes 24 to 48 hours.";
const LOAN_BANK_TRANSFER_SUBLINE =
  "We're verifying the loan amount transferred from your bank. This usually takes 24 to 48 hours, after which we'll start getting your car ready for delivery.";

const FULL_PAYMENT_HEADLINE = "Your payment is complete";
const FULL_PAYMENT_SUBLINE =
  "We'll now start getting your car ready for delivery. We'll keep you updated on the next steps.";

/** Post–full down payment: hero + CTA + timeline (DP done; disbursement or delivery next). */
export function DownPaymentInsuranceSetupScreen() {
  const searchParams = useSearchParams();
  const { isFullPayment } = useFullPaymentJourney();
  const loanAmount = searchParams.get("loan_amount");
  const bank = searchParams.get("bank");
  const bankTransferRef = searchParams.get("bank_transfer_ref");
  const isSelfFinance = bank === "self_finance" || bankTransferRef != null;

  const headline = isFullPayment
    ? FULL_PAYMENT_HEADLINE
    : bankTransferRef
      ? LOAN_BANK_TRANSFER_HEADLINE
      : LOAN_HEADLINE;
  const subline = isFullPayment
    ? FULL_PAYMENT_SUBLINE
    : bankTransferRef
      ? LOAN_BANK_TRANSFER_SUBLINE
      : LOAN_SUBLINE;

  const heroSummaryCard = useMemo(() => {
    if (isFullPayment || !bankTransferRef) return undefined;
    return (
      <section
        className="w-full rounded-xl border border-[#e8e8e8] bg-white px-4 py-3 text-left"
        aria-label="Bank transfer reference"
      >
        <dl className="m-0 flex items-center justify-between gap-3">
          <dt className="text-sm font-normal leading-5 text-[#4b4b4b]">UTR number</dt>
          <dd className="break-all text-base font-medium leading-6 text-[#121212]">
            {bankTransferRef}
          </dd>
        </dl>
      </section>
    );
  }, [bankTransferRef, isFullPayment]);

  const whatsNextCard = useMemo(() => {
    if (isFullPayment) {
      return (
        <LoanProcessingWhatsNext variant="full_payment_complete" fullPaymentJourney />
      );
    }
    if (isSelfFinance) {
      return (
        <LoanProcessingWhatsNext variant="insurance_premium_due" selfFinanceJourney />
      );
    }
    return <LoanProcessingWhatsNext variant="down_payment_complete" />;
  }, [isFullPayment, isSelfFinance]);

  const nextHref = isFullPayment
    ? buildPayInsurancePremiumHref()
    : isSelfFinance
      ? buildPayInsurancePremiumHref({
          bank: bank ?? "self_finance",
          loanAmount,
        })
      : buildLoanDisbursementReceivedHref(loanAmount);

  return (
    <KycBookingProcessingScreen
      headline={headline}
      subline={subline}
      heroIllustrationSrc={KYC_ASSETS.downPaymentCompleteHero}
      heroSummaryCard={heroSummaryCard}
      nextHref={nextHref}
      prefetchHref={nextHref}
      nextCtaLabel="Next"
      whatsNextCard={whatsNextCard}
    />
  );
}
