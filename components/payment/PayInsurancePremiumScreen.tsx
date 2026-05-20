"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { FULL_PAYMENT_INSURANCE_INR } from "@/components/payment/loan-amount-demo-constants";
import { ZeroDepInsuranceCoverageCard } from "@/components/payment/ZeroDepInsuranceCoverageCard";
import {
  buildInsurancePremiumCheckoutHref,
  FULL_PAYMENT_BANK_ID,
  type InsuranceJourneyQuery,
} from "@/lib/paymentUrls";

const HEADLINE = "Just the insurance left";
const SUBLINE =
  "Once you pay, we'll get your policy ready. Your car is covered from day one.";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

/**
 * Fixed insurance premium before {@link CarDeliveryInsurancePrepScreen}.
 * Full payment, ACKO Drive loan, and self finance — fixed insurance premium before car insurance prep.
 */
export function PayInsurancePremiumScreen() {
  const searchParams = useSearchParams();

  const journeyParams = useMemo((): InsuranceJourneyQuery => {
    return {
      bank: searchParams.get("bank"),
      loanAmount: searchParams.get("loan_amount"),
    };
  }, [searchParams]);

  const isFullPayment = journeyParams.bank === FULL_PAYMENT_BANK_ID;
  const isSelfFinance = journeyParams.bank === "self_finance";

  const nextHref = useMemo(
    () => buildInsurancePremiumCheckoutHref(FULL_PAYMENT_INSURANCE_INR, journeyParams),
    [journeyParams],
  );

  const heroSummaryCard = useMemo(
    () => <ZeroDepInsuranceCoverageCard premiumAmountInr={FULL_PAYMENT_INSURANCE_INR} />,
    [],
  );

  const whatsNextCard = useMemo(
    () => (
      <LoanProcessingWhatsNext
        variant="insurance_premium_due"
        fullPaymentJourney={isFullPayment}
        selfFinanceJourney={isSelfFinance}
      />
    ),
    [isFullPayment, isSelfFinance],
  );

  return (
    <KycBookingProcessingScreen
      headline={HEADLINE}
      subline={SUBLINE}
      heroIllustrationSrc={KYC_ASSETS.insurancePremiumHero}
      nextHref={nextHref}
      prefetchHref={nextHref}
      nextCtaLabel={`Pay ${formatInr(FULL_PAYMENT_INSURANCE_INR)}`}
      heroSummaryCard={heroSummaryCard}
      whatsNextCard={whatsNextCard}
    />
  );
}
