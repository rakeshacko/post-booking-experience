"use client";

import { useMemo } from "react";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { WhatsNextTimeline } from "@/components/kyc/WhatsNextTimeline";
import { DownPaymentSummaryCard } from "@/components/payment/DownPaymentSummaryCard";
import { BOOKING_PAYMENT_SUMMARY_INR } from "@/lib/payment-summary-demo";

const PAYMENT_DEFAULT_HEADLINE = "How would you like to pay, Sharath?";

const HERO_SUBTEXT =
  "Choose from ACKO Drive Finance, Self Finance or Full Cash. More details on the next screen.";

const WHATS_NEXT_SUB_PAYMENT = HERO_SUBTEXT;

/** Car allocation is complete; user is on the payment step (timeline matches journey). */
const WHATS_NEXT_CAR_ALLOCATION_ALLOCATED =
  "Your car has been allocated to you. Your selected variant and colour are confirmed.";

const PAYMENT_WARNING_LINE = "Confirm by 24 Apr, 3:00 PM to avoid cancellation";

/**
 * Payment default — same shell and motion as `KycBookingProcessingScreen` (e.g. `/car-allocation/pending`):
 * nav + manage booking sheet, payment hero illustration, “See your delivery timeline” sheet, primary CTA.
 */
export function PaymentDefaultScreen() {
  const whatsNextCard = useMemo(
    () => (
      <WhatsNextTimeline
        variant="default"
        surface="flat"
        firstStepTitle="Car allocation"
        firstStepDescription={WHATS_NEXT_CAR_ALLOCATION_ALLOCATED}
        secondStepTitle="Payment"
        secondStepDescription={WHATS_NEXT_SUB_PAYMENT}
        thirdStepTitle="Car delivery"
        thirdStepDescription="Estimated delivery by 2 Mar 2026"
        firstStepStatus="done"
        secondStepStatus="in_progress"
        thirdStepStatus="next"
      />
    ),
    [],
  );

  return (
    <KycBookingProcessingScreen
      headline={PAYMENT_DEFAULT_HEADLINE}
      subline={HERO_SUBTEXT}
      heroSummaryCard={
        <DownPaymentSummaryCard
          variant="booking_payment"
          downPaymentTotalInr={BOOKING_PAYMENT_SUMMARY_INR.ackoDrivePriceInr}
          amountPaidInr={BOOKING_PAYMENT_SUMMARY_INR.bookingAmountPaidInr}
          remainingAmountInr={BOOKING_PAYMENT_SUMMARY_INR.amountToPayInr}
        />
      }
      heroIllustrationSrc={KYC_ASSETS.paymentHero}
      nextHref="/payment/choose"
      prefetchHref="/payment/choose"
      ctaWarningLine={PAYMENT_WARNING_LINE}
      nextCtaLabel="Choose how to pay"
      whatsNextCard={whatsNextCard}
      manageBookingShowVehicleIdentification
    />
  );
}
