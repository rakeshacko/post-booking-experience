"use client";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { RtoRegistrationStatusCard } from "@/components/payment/RtoRegistrationStatusCard";

const HEADLINE = "We're registering your car with the RTO, Sharath!";
const SUBLINE =
  "This usually takes a few working days. We'll update you as your registration moves forward.";

/**
 * After insurance is set up — RTO is the active delivery milestone (see What&apos;s next nested rail).
 */
export function CarDeliveryRtoPrepScreen() {
  return (
    <KycBookingProcessingScreen
      headline={HEADLINE}
      subline={SUBLINE}
      heroIllustrationSrc={KYC_ASSETS.rtoRegistrationProcessHero}
      nextHref="/payment/car-delivery-schedule"
      prefetchHref="/payment/car-delivery-schedule"
      nextCtaLabel="Next"
      heroSummaryCard={<RtoRegistrationStatusCard />}
      whatsNextCard={<LoanProcessingWhatsNext variant="delivery_rto_prep" />}
    />
  );
}
