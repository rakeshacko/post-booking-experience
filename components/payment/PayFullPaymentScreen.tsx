"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { DownPaymentSummaryCard } from "@/components/payment/DownPaymentSummaryCard";
import { FullPaymentAmountDueCard } from "@/components/payment/FullPaymentAmountDueCard";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";
import { FULL_PAYMENT_CAR_AMOUNT_INR } from "@/components/payment/loan-amount-demo-constants";
import { buildFullPaymentCheckoutHref } from "@/lib/paymentUrls";

const HEADLINE_FIRST = "Your car payment is due";
const HEADLINE_REMAINING = "Finish your car payment";

const PAY_FULL_PAYMENT_CTA_WARNING =
  "Complete your full payment by 30 May to keep your booking active";

const FULL_PAYMENT_TIMELINE_DEADLINE = "30 May";

const SUBLINE =
  "You can pay in one go or across multiple transactions.";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Full payment — same hero layout as {@link PayDownPaymentScreen}; CTA continues to mock checkout
 * with instalment support. After a partial payment, URL includes `original_down_payment` and lower
 * `down_payment` (remaining).
 */
export function PayFullPaymentScreen() {
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
    summary,
    amountDueInr,
    paymentInProgressDescription,
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

    if (hasRemainingFlow) {
      const received = fullCommitment - totalDue;
      return {
        headline: HEADLINE_REMAINING,
        subline: SUBLINE,
        nextCtaLabel: "Pay remaining amount",
        nextHref: href,
        prefetchHref: href,
        summary: {
          downPaymentTotalInr: fullCommitment,
          amountPaidInr: received,
          remainingAmountInr: totalDue,
        },
        amountDueInr: totalDue,
        paymentInProgressDescription: `Pay ${formatInr(totalDue)} before ${FULL_PAYMENT_TIMELINE_DEADLINE}`,
      };
    }

    return {
      headline: HEADLINE_FIRST,
      subline: SUBLINE,
      nextCtaLabel: "Pay",
      nextHref: href,
      prefetchHref: href,
      summary: null,
      amountDueInr: totalDue,
      paymentInProgressDescription: undefined,
    };
  }, [amountDueParam, originalAmountParam]);

  const onPay = useCallback(() => {
    router.push(nextHref);
  }, [router, nextHref]);

  const whatsNextCard = useMemo(
    () => (
      <LoanProcessingWhatsNext
        variant="full_payment"
        fullPaymentJourney
        paymentInProgressDescription={paymentInProgressDescription}
      />
    ),
    [paymentInProgressDescription],
  );

  return (
    <KycBookingProcessingScreen
      headline={headline}
      subline={subline}
      heroIllustrationSrc={KYC_ASSETS.paymentHero}
      nextHref={nextHref}
      prefetchHref={prefetchHref}
      onPrimaryCtaClick={onPay}
      nextCtaLabel={nextCtaLabel}
      ctaWarningLine={PAY_FULL_PAYMENT_CTA_WARNING}
      whatsNextCard={whatsNextCard}
      heroSummaryCard={
        summary ? (
          <DownPaymentSummaryCard
            variant="full_payment"
            downPaymentTotalInr={summary.downPaymentTotalInr}
            amountPaidInr={summary.amountPaidInr}
            remainingAmountInr={summary.remainingAmountInr}
          />
        ) : (
          <FullPaymentAmountDueCard variant="car_only" amountDueInr={amountDueInr} />
        )
      }
    />
  );
}
