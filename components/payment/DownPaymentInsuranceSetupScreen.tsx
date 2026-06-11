"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { useFullPaymentJourney } from "@/components/payment/use-full-payment-journey";
import { FULL_PAYMENT_INSURANCE_INR } from "@/components/payment/loan-amount-demo-constants";
import { buildLoanDisbursementReceivedHref, buildPayInsurancePremiumHref } from "@/lib/paymentUrls";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

const LOAN_HEADLINE = "Down payment received";
const LOAN_BANK_TRANSFER_HEADLINE = "Payment received";
const LOAN_SUBLINE =
  "The bank is moving your loan to the dealer. Banks take 24–48 hours here — I'll confirm the moment it lands.";
const LOAN_DISBURSEMENT_INFO_BODY = `Insurance (${formatInr(FULL_PAYMENT_INSURANCE_INR)}) is due much later — I'll ask just before delivery, when the RTO registration needs it.`;
const LOAN_BANK_TRANSFER_SUBLINE =
  "I'm confirming the transfer from your bank — it takes 24–48 hours to clear. The moment it does, I start your delivery prep.";

const FULL_PAYMENT_HEADLINE = "Your payment is complete";
const FULL_PAYMENT_SUBLINE = "Your car is now being prepared for delivery.";
const FULL_PAYMENT_INSURANCE_INFO_BODY = `${formatInr(FULL_PAYMENT_INSURANCE_INR)} insurance payment is due before car registration. I'll remind you.`;

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
        className="w-full rounded-xl bg-white card-elevated px-4 py-3 text-left"
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

  const infoBox = useMemo(() => {
    if (bankTransferRef) return undefined;
    if (isFullPayment) return { body: FULL_PAYMENT_INSURANCE_INFO_BODY };
    return { body: LOAN_DISBURSEMENT_INFO_BODY };
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
      callLabel="Want an update? I can call you"
      infoBox={infoBox}
      heroIllustrationSrc={KYC_ASSETS.downPaymentCompleteHero}
      heroSummaryCard={heroSummaryCard}
      nextHref={nextHref}
      prefetchHref={nextHref}
      nextCtaLabel="Next"
      whatsNextCard={whatsNextCard}
    />
  );
}
