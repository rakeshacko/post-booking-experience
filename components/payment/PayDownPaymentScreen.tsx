"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { KycBookingProcessingScreen } from "@/components/kyc/KycBookingProcessingScreen";
import { DownPaymentSummaryCard } from "@/components/payment/DownPaymentSummaryCard";
import {
  ACKO_LOAN_DOWN_PAYMENT_INR,
  BANK_DISBURSEMENT_INR,
} from "@/components/payment/loan-amount-demo-constants";
import { buildDownPaymentCheckoutHref } from "@/lib/paymentUrls";
import { useDealerReference } from "@/lib/dealer-visibility";

const HEADLINE_REMAINING = "Complete your remaining down payment, Sharath!";

/** Urgency line above the primary CTA — consequence, not a deadline to procrastinate against. */
const PAY_DOWN_PAYMENT_CTA_WARNING =
  "Delivery prep starts the moment this lands — every day here moves your delivery date";

/**
 * Remaining-instalment step after a partial down payment (progress + CTA).
 * The fresh flow no longer stops here — the split was just shown on the
 * sanctioned / self-finance amount screens, so fresh hits forward to checkout.
 */
export function PayDownPaymentScreen() {
  const router = useRouter();
  const dealerRef = useDealerReference();
  const searchParams = useSearchParams();
  const bank = searchParams.get("bank");
  const loanAmount = searchParams.get("loan_amount");
  const downPayment = searchParams.get("down_payment");
  const originalDownPaymentParam = searchParams.get("original_down_payment");

  const { summary, checkoutHref } = useMemo(() => {
    const d = downPayment != null && downPayment !== "" ? Number(downPayment) : NaN;
    const o =
      originalDownPaymentParam != null && originalDownPaymentParam !== ""
        ? Number(originalDownPaymentParam)
        : NaN;
    const hasRemainingFlow =
      Number.isFinite(d) && d > 0 && Number.isFinite(o) && o > 0 && o > d;

    // `down_payment` is the NET cash due now — already excludes the price lock
    // and insurance (the price identity: lock + disbursement + insurance + DP = total).
    const dueInr = Number.isFinite(d) && d > 0 ? Math.round(d) : ACKO_LOAN_DOWN_PAYMENT_INR;

    if (hasRemainingFlow) {
      return {
        summary: {
          downPaymentTotalInr: Math.round(o),
          amountPaidInr: Math.max(0, Math.round(o) - Math.round(d)),
          remainingAmountInr: Math.round(d),
        },
        checkoutHref: buildDownPaymentCheckoutHref(bank, loanAmount, dueInr),
      };
    }

    return {
      summary: null,
      checkoutHref: buildDownPaymentCheckoutHref(
        bank,
        loanAmount ?? String(BANK_DISBURSEMENT_INR),
        dueInr,
      ),
    };
  }, [bank, loanAmount, downPayment, originalDownPaymentParam]);

  /** Fresh flow — the split was the previous screen; go straight to checkout. */
  useEffect(() => {
    if (summary == null) router.replace(checkoutHref);
  }, [summary, checkoutHref, router]);

  if (summary == null) return null;

  return (
    <KycBookingProcessingScreen
      headline={HEADLINE_REMAINING}
      subline={`The bank releases its disbursement to ${dealerRef} once your full down payment is in.`}
      nextHref={checkoutHref}
      prefetchHref={checkoutHref}
      nextCtaLabel="Pay remaining amount"
      ctaWarningLine={PAY_DOWN_PAYMENT_CTA_WARNING}
      heroSummaryCard={
        <DownPaymentSummaryCard
          downPaymentTotalInr={summary.downPaymentTotalInr}
          amountPaidInr={summary.amountPaidInr}
          remainingAmountInr={summary.remainingAmountInr}
        />
      }
      manageBookingShowVehicleIdentification
    />
  );
}
