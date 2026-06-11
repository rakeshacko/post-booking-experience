"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { CarPriceBreakupCard } from "@/components/concierge/artifacts";
import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { AckoDriveFinanceSuccessLottie } from "@/components/payment/AckoDriveFinanceSuccessLottie";
import { DownPaymentSummaryCard } from "@/components/payment/DownPaymentSummaryCard";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import {
  BOOKING_AMOUNT_PAID_INR,
  FULL_PAYMENT_CAR_AMOUNT_INR,
  FULL_PAYMENT_INSURANCE_INR,
  ON_ROAD_PRICE_INR,
} from "@/components/payment/loan-amount-demo-constants";
import { buildFullPaymentCheckoutHref } from "@/lib/paymentUrls";

const HEADLINE_FIRST = "You're paying in full";
const HEADLINE_REMAINING = "Finish your car payment";

const SUBLINE_FIRST =
  "Your ₹10,000 lock already counts toward the price. Pay the car amount now — in one go or in parts — and insurance waits till just before delivery, for RTO registration.";

const SUBLINE_REMAINING =
  "You can pay in one go or across multiple transactions.";

const CTA_WARNING_LINE =
  "Delivery prep starts only after full payment — every day here moves your date";


function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

/**
 * Full payment — action step after confirm bottom sheet on `/payment/choose`, and after
 * partial instalments (URL: `down_payment` + optional `original_down_payment`). Primary CTA
 * goes to mock checkout (`/payment?bank=full_payment&…`).
 */
export function FullPaymentConfirmedScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const amountDueParam = searchParams.get("down_payment");
  const originalAmountParam = searchParams.get("original_down_payment");

  const {
    headline,
    subline,
    nextCtaLabel,
    nextHref,
    prefetchHref,
    heroSummaryCard,
    whatsNextCard,
    heroIllustrationSrc,
    heroIllustrationSlot,
  } = useMemo(() => {
    const due =
      amountDueParam != null && amountDueParam !== "" ? Number(amountDueParam) : NaN;
    const original =
      originalAmountParam != null && originalAmountParam !== ""
        ? Number(originalAmountParam)
        : NaN;
    const totalDue =
      Number.isFinite(due) && due > 0 ? Math.round(due) : FULL_PAYMENT_CAR_AMOUNT_INR;
    const fullCommitment =
      Number.isFinite(original) && original > 0 ? Math.round(original) : totalDue;
    const hasRemainingFlow =
      Number.isFinite(due) && due > 0 && fullCommitment > totalDue;

    const href = buildFullPaymentCheckoutHref(
      String(totalDue),
      hasRemainingFlow ? String(fullCommitment) : null,
    );

    const paymentInProgressDescription = `Pay ${formatInr(
      hasRemainingFlow ? totalDue : FULL_PAYMENT_CAR_AMOUNT_INR,
    )} — delivery prep starts after this`;

    if (hasRemainingFlow) {
      const received = fullCommitment - totalDue;
      return {
        headline: HEADLINE_REMAINING,
        subline: SUBLINE_REMAINING,
        nextCtaLabel: "Pay remaining amount",
        nextHref: href,
        prefetchHref: href,
        heroIllustrationSrc: KYC_ASSETS.paymentHero,
        heroIllustrationSlot: undefined,
        heroSummaryCard: (
          <DownPaymentSummaryCard
            variant="full_payment"
            downPaymentTotalInr={fullCommitment}
            amountPaidInr={received}
            remainingAmountInr={totalDue}
          />
        ),
        whatsNextCard: (
          <LoanProcessingWhatsNext
            variant="full_payment"
            fullPaymentJourney
            paymentInProgressDescription={paymentInProgressDescription}
          />
        ),
      };
    }

    return {
      headline: HEADLINE_FIRST,
      subline: SUBLINE_FIRST,
      nextCtaLabel: "Pay",
      nextHref: href,
      prefetchHref: href,
      heroIllustrationSrc: undefined,
      heroIllustrationSlot: <AckoDriveFinanceSuccessLottie />,
      heroSummaryCard: (
        <CarPriceBreakupCard
          totalInr={ON_ROAD_PRICE_INR}
          bookingPaidInr={BOOKING_AMOUNT_PAID_INR}
          insuranceInr={FULL_PAYMENT_INSURANCE_INR}
          dueLabel="Car amount — due now"
          dueInr={FULL_PAYMENT_CAR_AMOUNT_INR}
        />
      ),
      whatsNextCard: (
        <LoanProcessingWhatsNext
          variant="full_payment_action"
          paymentInProgressDescription={paymentInProgressDescription}
        />
      ),
    };
  }, [amountDueParam, originalAmountParam]);

  const onPay = useCallback(() => {
    router.push(nextHref);
  }, [router, nextHref]);

  return (
    <KycBookingProcessingScreen
      headline={headline}
      subline={subline}
      heroIllustrationSrc={heroIllustrationSrc}
      heroIllustrationSlot={heroIllustrationSlot}
      heroSummaryCard={heroSummaryCard}
      nextHref={nextHref}
      prefetchHref={prefetchHref}
      onPrimaryCtaClick={onPay}
      nextCtaLabel={nextCtaLabel}
      ctaWarningLine={CTA_WARNING_LINE}
      whatsNextCard={whatsNextCard}
      manageBookingShowVehicleIdentification
    />
  );
}
