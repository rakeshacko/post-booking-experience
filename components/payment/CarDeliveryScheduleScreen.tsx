"use client";

import { useMemo } from "react";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { useFullPaymentJourney } from "@/components/payment/use-full-payment-journey";

const HEADLINE = "Your car is ready, Sharath!";
const SUBLINE =
  "It's registered and ready for delivery. Pick a date and time that works for you.";

/**
 * Final pre-delivery step in this demo — scheduling (timeline: insurance + RTO done; date selection active).
 */
export function CarDeliveryScheduleScreen() {
  const { isFullPayment } = useFullPaymentJourney();

  const whatsNextCard = useMemo(
    () => (
      <LoanProcessingWhatsNext
        variant="delivery_schedule_prep"
        fullPaymentJourney={isFullPayment}
      />
    ),
    [isFullPayment],
  );

  return (
    <KycBookingProcessingScreen
      headline={HEADLINE}
      subline={SUBLINE}
      heroIllustrationSrc={KYC_ASSETS.carDeliveryHero}
      nextHref="/kyc"
      prefetchHref="/kyc"
      nextCtaLabel="Schedule delivery"
      whatsNextCard={whatsNextCard}
    />
  );
}
