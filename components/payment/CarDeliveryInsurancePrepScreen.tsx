"use client";

import { useMemo } from "react";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { useFullPaymentJourney } from "@/components/payment/use-full-payment-journey";
import { ZeroDepInsuranceCoverageCard } from "@/components/payment/ZeroDepInsuranceCoverageCard";

const HEADLINE = "We're setting up your car insurance, Sharath!";
const INSURANCE_PREP_DAY_RANGE = "2–3";
const SUBLINE = `We're insuring your car. This usually takes ${INSURANCE_PREP_DAY_RANGE} days.`;

/** After down-payment / disbursement messaging — delivery prep + insurance (hero card + timeline). */
export function CarDeliveryInsurancePrepScreen() {
  const { isFullPayment, withBank } = useFullPaymentJourney();

  const whatsNextCard = useMemo(
    () => (
      <LoanProcessingWhatsNext
        variant="delivery_insurance_prep"
        fullPaymentJourney={isFullPayment}
      />
    ),
    [isFullPayment],
  );

  return (
    <KycBookingProcessingScreen
      headline={HEADLINE}
      subline={SUBLINE}
      heroIllustrationSrc={KYC_ASSETS.insuranceInProgressHero}
      nextHref={withBank("/payment/car-delivery-rto")}
      prefetchHref={withBank("/payment/car-delivery-rto")}
      nextCtaLabel="Next"
      heroSummaryCard={<ZeroDepInsuranceCoverageCard />}
      whatsNextCard={whatsNextCard}
    />
  );
}
