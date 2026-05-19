"use client";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";

const HEADLINE = "We've received your down payment, Sharath!";
const SUBLINE =
  "Loan disbursement will be processed shortly. We'll update you with the next steps.";

/** Post–full down payment: hero + CTA + loan timeline (DP done; disbursement next). */
export function DownPaymentInsuranceSetupScreen() {
  return (
    <KycBookingProcessingScreen
      headline={HEADLINE}
      subline={SUBLINE}
      heroIllustrationSrc={KYC_ASSETS.downPaymentCompleteHero}
      nextHref="/payment/car-delivery-insurance-prep"
      prefetchHref="/payment/car-delivery-insurance-prep"
      nextCtaLabel="Next"
      whatsNextCard={<LoanProcessingWhatsNext variant="down_payment_complete" />}
    />
  );
}
