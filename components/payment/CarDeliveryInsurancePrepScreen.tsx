"use client";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { ZeroDepInsuranceCoverageCard } from "@/components/payment/ZeroDepInsuranceCoverageCard";

const HEADLINE = "We're setting up your car insurance, Sharath!";
const INSURANCE_PREP_DAY_RANGE = "2–3";
const SUBLINE = `We're insuring your car. This usually takes ${INSURANCE_PREP_DAY_RANGE} days.`;

/** After down-payment / disbursement messaging — delivery prep + insurance (hero card + timeline). */
export function CarDeliveryInsurancePrepScreen() {
  return (
    <KycBookingProcessingScreen
      headline={HEADLINE}
      subline={SUBLINE}
      heroIllustrationSrc={KYC_ASSETS.insuranceInProgressHero}
      nextHref="/payment/car-delivery-rto"
      prefetchHref="/payment/car-delivery-rto"
      nextCtaLabel="Next"
      heroSummaryCard={<ZeroDepInsuranceCoverageCard />}
      whatsNextCard={<LoanProcessingWhatsNext variant="delivery_insurance_prep" />}
    />
  );
}
