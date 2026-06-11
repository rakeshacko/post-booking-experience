"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { useFullPaymentJourney } from "@/components/payment/use-full-payment-journey";
import { ZeroDepInsuranceCoverageCard } from "@/components/payment/ZeroDepInsuranceCoverageCard";

const HEADLINE = "You're covered, Sharath ✓";
const SUBLINE =
  "Issued the moment your payment landed — insurance is us, after all. Zero depreciation, active from today. Next, I take your registration file to the RTO.";

/** Policy issued instantly (ACKO is the insurer) — news turn, then on to the RTO wait. */
export function CarDeliveryInsurancePrepScreen() {
  const searchParams = useSearchParams();
  const { isFullPayment, withBank } = useFullPaymentJourney();
  const isSelfFinance = searchParams.get("bank") === "self_finance";

  const whatsNextCard = useMemo(
    () => (
      <LoanProcessingWhatsNext
        variant="delivery_insurance_prep"
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
      callLabel="Questions about coverage? I can call you"
      heroIllustrationSrc={KYC_ASSETS.insuranceInProgressHero}
      nextHref={withBank("/payment/car-delivery-rto")}
      prefetchHref={withBank("/payment/car-delivery-rto")}
      nextCtaLabel="On to the RTO"
      heroSummaryCard={
        <ZeroDepInsuranceCoverageCard description="Your car is covered by ACKO Drive Shield — zero depreciation plus 5 add-ons, only on ACKO Drive." />
      }
      whatsNextCard={whatsNextCard}
    />
  );
}
