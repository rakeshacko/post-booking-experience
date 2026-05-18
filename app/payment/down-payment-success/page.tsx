"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { DownPaymentInstalmentSuccess } from "@/components/payment/DownPaymentInstalmentSuccess";
import { CelebrationPageTransition } from "@/components/ui/page-transition";

import {
  buildMarginMoneySlipActionHref,
  buildPayDownPaymentHref,
} from "@/lib/paymentUrls";

const INSURANCE_SETUP_PATH = "/payment/down-payment-insurance-setup";

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
          nextHref: buildPayDownPaymentHref(bank, loanAmount, remaining, original),
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
          : INSURANCE_SETUP_PATH,
      };
    }

    if (original != null) {
      return {
        subline: `${formatInr(original)} down payment received.`,
        nextHref:
          bank === "self_finance"
            ? buildMarginMoneySlipActionHref({
                bank,
                loanAmount,
                originalDownPaymentInr: original,
              })
            : INSURANCE_SETUP_PATH,
      };
    }

    return {
      subline: "Your payment was received.",
      nextHref: INSURANCE_SETUP_PATH,
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
