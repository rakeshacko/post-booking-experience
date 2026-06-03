"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { DownPaymentAmountSummaryCard } from "@/components/payment/DownPaymentAmountSummaryCard";
import { DownPaymentSummaryCard } from "@/components/payment/DownPaymentSummaryCard";
import { carDownPaymentFromTotalInr } from "@/components/payment/loan-amount-demo-constants";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";

const HEADLINE_FIRST = "Time to pay your down payment, Sharath!";
const HEADLINE_REMAINING = "Complete your remaining down payment, Sharath!";

/** Same treatment as `PaymentDefaultScreen` — orange line above primary CTA. */
const PAY_DOWN_PAYMENT_CTA_WARNING =
  "Pay by 31 March 2026, 11:59 PM to avoid cancellation";

/** Shorter deadline copy for the loan timeline “Down payment” substep (matches user-facing example). */
const DOWN_PAYMENT_TIMELINE_DEADLINE = "31 March";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function buildPaymentHref(
  bank: string | null,
  loanAmount: string | null,
  downPayment: string | null,
  originalDownPayment: string | null,
) {
  const q = new URLSearchParams();
  if (bank) q.set("bank", bank);
  if (loanAmount) q.set("loan_amount", loanAmount);
  if (downPayment) q.set("down_payment", downPayment);
  if (
    originalDownPayment &&
    downPayment &&
    originalDownPayment !== downPayment
  ) {
    q.set("original_down_payment", originalDownPayment);
  }
  const qs = q.toString();
  return qs ? `/payment?${qs}` : "/payment";
}

/**
 * Post–choose-loan: same hero layout as loan sanctioned; CTA continues to mock payment with plan query params.
 * After a partial instalment, URL includes `original_down_payment` & lower `down_payment` (remaining).
 */
export function PayDownPaymentScreen() {
  const searchParams = useSearchParams();
  const bank = searchParams.get("bank");
  const loanAmount = searchParams.get("loan_amount");
  const downPayment = searchParams.get("down_payment");
  const originalDownPaymentParam = searchParams.get("original_down_payment");

  const {
    headline,
    subline,
    nextCtaLabel,
    nextHref,
    prefetchHref,
    summary,
    downPaymentAmountInr,
    downPaymentTimelineDescription,
  } = useMemo(() => {
    const d = downPayment != null && downPayment !== "" ? Number(downPayment) : NaN;
    const o =
      originalDownPaymentParam != null && originalDownPaymentParam !== ""
        ? Number(originalDownPaymentParam)
        : NaN;
    const hasRemainingFlow =
      Number.isFinite(d) &&
      d > 0 &&
      Number.isFinite(o) &&
      o > 0 &&
      o > d;

    const href = buildPaymentHref(bank, loanAmount, downPayment, originalDownPaymentParam);

    const timelinePayLine =
      Number.isFinite(d) && d > 0
        ? `Pay ${formatInr(Math.round(d))} before ${DOWN_PAYMENT_TIMELINE_DEADLINE}`
        : null;

    if (hasRemainingFlow) {
      const carTotalInr = carDownPaymentFromTotalInr(o);
      const carRemainingInr = carDownPaymentFromTotalInr(d);
      const carPaidInr = Math.max(0, carTotalInr - carRemainingInr);
      return {
        headline: HEADLINE_REMAINING,
        subline:
          "The bank will disburse the loan amount after the full down payment is completed.",
        nextCtaLabel: "Pay remaining amount",
        nextHref: href,
        prefetchHref: href,
        summary: {
          downPaymentTotalInr: carTotalInr,
          amountPaidInr: carPaidInr,
          remainingAmountInr: carRemainingInr,
        },
        downPaymentAmountInr: null,
        downPaymentTimelineDescription: timelinePayLine,
      };
    }

    if (Number.isFinite(d) && d > 0) {
      return {
        headline: HEADLINE_FIRST,
        subline:
          "Your loan plan is confirmed. You can pay down payment in one go or split it across multiple instalments.",
        nextCtaLabel: "Pay down payment",
        nextHref: href,
        prefetchHref: href,
        summary: null,
        downPaymentAmountInr: carDownPaymentFromTotalInr(d),
        downPaymentTimelineDescription: timelinePayLine,
      };
    }

    const fallbackHref = buildPaymentHref(bank, loanAmount, downPayment, originalDownPaymentParam);
    return {
      headline: HEADLINE_FIRST,
      subline:
        "Your loan plan is confirmed. You can pay down payment in one go or split it across multiple instalments.",
      nextCtaLabel: "Pay down payment",
      nextHref: fallbackHref,
      prefetchHref: fallbackHref,
      summary: null,
      downPaymentAmountInr: null,
      downPaymentTimelineDescription: null,
    };
  }, [bank, loanAmount, downPayment, originalDownPaymentParam]);

  const whatsNextVariant =
    bank === "self_finance" ? "self_finance_down_payment" : "down_payment";

  return (
    <KycBookingProcessingScreen
      headline={headline}
      subline={subline}
      heroIllustrationSrc={KYC_ASSETS.paymentHero}
      nextHref={nextHref}
      prefetchHref={prefetchHref}
      nextCtaLabel={nextCtaLabel}
      ctaWarningLine={PAY_DOWN_PAYMENT_CTA_WARNING}
      whatsNextCard={
        <LoanProcessingWhatsNext
          variant={whatsNextVariant}
          downPaymentInProgressDescription={
            downPaymentTimelineDescription ?? undefined
          }
        />
      }
      heroSummaryCard={
        summary ? (
          <DownPaymentSummaryCard
            downPaymentTotalInr={summary.downPaymentTotalInr}
            amountPaidInr={summary.amountPaidInr}
            remainingAmountInr={summary.remainingAmountInr}
          />
        ) : downPaymentAmountInr != null ? (
          <DownPaymentAmountSummaryCard downPaymentAmountInr={downPaymentAmountInr} />
        ) : undefined
      }
    />
  );
}
