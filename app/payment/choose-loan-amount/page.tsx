"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ACKO_LOAN_DOWN_PAYMENT_INR,
  BANK_DISBURSEMENT_INR,
} from "@/components/payment/loan-amount-demo-constants";
import { buildPayDownPaymentHref } from "@/lib/paymentUrls";

/**
 * Legacy — there is no loan-amount slider anymore: the bank's disbursement is
 * the bank's decision, and the down payment is derived from the price identity.
 */
function LegacyChooseLoanAmountRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    router.replace(
      buildPayDownPaymentHref(
        searchParams.get("bank"),
        String(BANK_DISBURSEMENT_INR),
        ACKO_LOAN_DOWN_PAYMENT_INR,
      ),
    );
  }, [router, searchParams]);

  return null;
}

export default function ChooseLoanAmountPage() {
  return (
    <Suspense fallback={null}>
      <LegacyChooseLoanAmountRedirect />
    </Suspense>
  );
}
