"use client";

import { useMemo } from "react";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { useFullPaymentJourney } from "@/components/payment/use-full-payment-journey";
import { RtoRegistrationStatusCard } from "@/components/payment/RtoRegistrationStatusCard";

const HEADLINE = "Your file is at the RTO, Sharath.";
const SUBLINE =
  "I've submitted your registration paperwork. The RTO takes a few working days — government clocks, not mine. I'll keep nudging and keep you posted.";

/**
 * After insurance is set up — RTO is the active delivery milestone (see What&apos;s next nested rail).
 */
export function CarDeliveryRtoPrepScreen() {
  const { isFullPayment, withBank } = useFullPaymentJourney();

  const whatsNextCard = useMemo(
    () => (
      <LoanProcessingWhatsNext
        variant="delivery_rto_prep"
        fullPaymentJourney={isFullPayment}
      />
    ),
    [isFullPayment],
  );

  return (
    <KycBookingProcessingScreen
      headline={HEADLINE}
      subline={SUBLINE}
      callLabel="Want an update? I can call you"
      heroIllustrationSrc={KYC_ASSETS.rtoRegistrationProcessHero}
      nextHref={withBank("/payment/car-delivery-schedule")}
      prefetchHref={withBank("/payment/car-delivery-schedule")}
      nextCtaLabel="Next"
      heroSummaryCard={<RtoRegistrationStatusCard />}
      whatsNextCard={whatsNextCard}
    />
  );
}
