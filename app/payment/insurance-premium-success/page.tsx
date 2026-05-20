"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { DownPaymentInstalmentSuccess } from "@/components/payment/DownPaymentInstalmentSuccess";
import { FULL_PAYMENT_INSURANCE_INR } from "@/components/payment/loan-amount-demo-constants";
import { CelebrationPageTransition } from "@/components/ui/page-transition";
import { buildCarDeliveryInsurancePrepHref } from "@/lib/paymentUrls";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

function parsePositiveInt(raw: string | null): number | null {
  if (raw == null || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n);
}

function InsurancePremiumSuccessInner() {
  const searchParams = useSearchParams();

  const { subline, nextHref } = useMemo(() => {
    const paid =
      parsePositiveInt(searchParams.get("paid")) ?? FULL_PAYMENT_INSURANCE_INR;
    return {
      subline: `We've received ${formatInr(paid)} for your car insurance.`,
      nextHref: buildCarDeliveryInsurancePrepHref({
        bank: searchParams.get("bank"),
        loanAmount: searchParams.get("loan_amount"),
      }),
    };
  }, [searchParams]);

  return (
    <CelebrationPageTransition>
      <DownPaymentInstalmentSuccess subline={subline} nextHref={nextHref} />
    </CelebrationPageTransition>
  );
}

/** Insurance premium ack; auto-advances to car insurance prep. */
export default function InsurancePremiumSuccessPage() {
  return (
    <Suspense fallback={null}>
      <InsurancePremiumSuccessInner />
    </Suspense>
  );
}
