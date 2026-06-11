"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { CarPriceBreakupCard } from "@/components/concierge/artifacts";
import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { KYC_ASSETS } from "@/components/kyc/kyc-assets";
import { bankForQueryParam } from "@/components/payment/acko-drive-finance-bank";
import { DownPaymentSummaryCard } from "@/components/payment/DownPaymentSummaryCard";
import {
  ACKO_LOAN_DOWN_PAYMENT_INR,
  BANK_DISBURSEMENT_INR,
  BOOKING_AMOUNT_PAID_INR,
  FULL_PAYMENT_INSURANCE_INR,
  ON_ROAD_PRICE_INR,
} from "@/components/payment/loan-amount-demo-constants";
import { LoanProcessingWhatsNext } from "@/components/payment/LoanProcessingWhatsNext";

const HEADLINE_FIRST = "Time to pay your down payment, Sharath!";
const HEADLINE_REMAINING = "Complete your remaining down payment, Sharath!";

/** Urgency line above the primary CTA — consequence, not a deadline to procrastinate against. */
const PAY_DOWN_PAYMENT_CTA_WARNING =
  "Delivery prep starts the moment this lands — every day here moves your delivery date";

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
        ? `Pay ${formatInr(Math.round(d))} — delivery prep starts after this`
        : null;

    // `down_payment` is the NET cash due now — already excludes the price lock
    // and insurance (the price identity: lock + disbursement + insurance + DP = total).
    if (hasRemainingFlow) {
      return {
        headline: HEADLINE_REMAINING,
        subline:
          "The bank releases its disbursement to the dealer once your full down payment is in.",
        nextCtaLabel: "Pay remaining amount",
        nextHref: href,
        prefetchHref: href,
        summary: {
          downPaymentTotalInr: Math.round(o),
          amountPaidInr: Math.max(0, Math.round(o) - Math.round(d)),
          remainingAmountInr: Math.round(d),
        },
        downPaymentAmountInr: null,
        downPaymentTimelineDescription: timelinePayLine,
      };
    }

    const dueInr = Number.isFinite(d) && d > 0 ? Math.round(d) : ACKO_LOAN_DOWN_PAYMENT_INR;
    const freshHref =
      Number.isFinite(d) && d > 0
        ? href
        : buildPaymentHref(
            bank,
            loanAmount ?? String(BANK_DISBURSEMENT_INR),
            String(dueInr),
            null,
          );
    return {
      headline: HEADLINE_FIRST,
      subline:
        "One last look at the split, then pay — in one go or across instalments. Insurance waits till just before delivery.",
      nextCtaLabel: "Pay down payment",
      nextHref: freshHref,
      prefetchHref: freshHref,
      summary: null,
      downPaymentAmountInr: dueInr,
      downPaymentTimelineDescription: timelinePayLine,
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
          <CarPriceBreakupCard
            totalInr={ON_ROAD_PRICE_INR}
            bookingPaidInr={BOOKING_AMOUNT_PAID_INR}
            disbursementLabel={
              bank === "self_finance"
                ? "Your bank disburses"
                : `${bankForQueryParam(bank).name} disburses`
            }
            disbursementInr={
              loanAmount != null && Number.isFinite(Number(loanAmount))
                ? Math.round(Number(loanAmount))
                : BANK_DISBURSEMENT_INR
            }
            insuranceInr={FULL_PAYMENT_INSURANCE_INR}
            dueLabel="Your down payment — due now"
            dueInr={downPaymentAmountInr}
          />
        ) : undefined
      }
    />
  );
}
