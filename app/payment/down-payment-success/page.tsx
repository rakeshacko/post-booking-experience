"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { DownPaymentInstalmentSuccess } from "@/components/payment/DownPaymentInstalmentSuccess";
import { CelebrationPageTransition } from "@/components/ui/page-transition";

import {
  buildInsuranceSetupHref,
  buildMarginMoneySlipActionHref,
  buildPayDownPaymentHref,
  buildPayFullPaymentHref,
  FULL_PAYMENT_BANK_ID,
} from "@/lib/paymentUrls";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function parsePositiveInt(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

function DownPaymentSuccessInner() {
  const searchParams = useSearchParams();

  const { subline, nextHref } = useMemo(() => {
    const bank = searchParams.get("bank");
    const loanAmount = searchParams.get("loan_amount");
    const original =
      parsePositiveInt(searchParams.get("original_down_payment")) ??
      parsePositiveInt(searchParams.get("total"));
    const paid = parsePositiveInt(searchParams.get("paid"));
    const remaining = parsePositiveInt(searchParams.get("remaining"));

    if (original != null && paid != null && remaining != null) {
      if (remaining > 0) {
        return {
          subline: `We’ve received ${formatInr(paid)}.`,
          nextHref:
            bank === FULL_PAYMENT_BANK_ID
              ? buildPayFullPaymentHref(remaining, original)
              : buildPayDownPaymentHref(bank, loanAmount, remaining, original),
        };
      }
      return {
        subline: `We’ve received ${formatInr(paid)}.`,
      nextHref:
        bank === "self_finance"
          ? buildMarginMoneySlipActionHref({
              bank,
              loanAmount,
              originalDownPaymentInr: original,
            })
          : buildInsuranceSetupHref(bank, loanAmount),
      };
    }

    if (original != null) {
      const isFullPayment = bank === FULL_PAYMENT_BANK_ID;
      return {
        subline: isFullPayment
          ? `${formatInr(original)} full payment received.`
          : `${formatInr(original)} down payment received.`,
        nextHref:
          bank === "self_finance"
            ? buildMarginMoneySlipActionHref({
                bank,
                loanAmount,
                originalDownPaymentInr: original,
              })
            : buildInsuranceSetupHref(bank, loanAmount),
      };
    }

    return {
      subline: "Your payment was received.",
      nextHref: buildInsuranceSetupHref(bank, loanAmount),
    };
  }, [searchParams]);

  return (
    <CelebrationPageTransition>
      <DownPaymentInstalmentSuccess subline={subline} nextHref={nextHref} />
    </CelebrationPageTransition>
  );
}

export default function DownPaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <DownPaymentSuccessInner />
    </Suspense>
  );
}
