"use client";

import { Suspense } from "react";

import { PayFullPaymentScreen } from "@/components/payment/PayFullPaymentScreen";

/**
 * Full payment — prompt to pay the full ACKO Drive price (layout aligned with `/payment/pay-down-payment`).
 */
export default function PayFullPaymentPage() {
  return (
    <Suspense fallback={null}>
      <PayFullPaymentScreen />
    </Suspense>
  );
}
