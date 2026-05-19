"use client";

import { useMemo } from "react";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { useFullPaymentJourney } from "@/components/payment/use-full-payment-journey";

const HEADLINE = "Your payment is complete";
const SUBLINE =
  "We'll now start getting your car ready for delivery. We'll keep you updated on the next steps.";

/** Post–full down payment: hero + CTA + timeline (DP done; disbursement or delivery next). */
export function DownPaymentInsuranceSetupScreen() {
  const { isFullPayment, withBank } = useFullPaymentJourney();

  const whatsNextCard = useMemo(
    () => (
      <LoanProcessingWhatsNext
        variant={isFullPayment ? "full_payment_complete" : "down_payment_complete"}
        fullPaymentJourney={isFullPayment}
      />
    ),
    [isFullPayment],
  );

  return (
    <KycBookingProcessingScreen
      headline={HEADLINE}
      subline={SUBLINE}
      heroIllustrationSrc={KYC_ASSETS.downPaymentCompleteHero}
      nextHref={withBank("/payment/car-delivery-insurance-prep")}
      prefetchHref={withBank("/payment/car-delivery-insurance-prep")}
      nextCtaLabel="Next"
      whatsNextCard={whatsNextCard}
    />
  );
}
