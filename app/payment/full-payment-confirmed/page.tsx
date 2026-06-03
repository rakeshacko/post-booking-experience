"use client";

import { Suspense } from "react";

import { FullPaymentConfirmedScreen } from "@/components/payment/FullPaymentConfirmedScreen";

/**
 * Full payment — action step after payment-option confirmation (same pattern as ACKO finance action).
 */
export default function FullPaymentConfirmedPage() {
  return (
    <Suspense fallback={null}>
      <FullPaymentConfirmedScreen />
    </Suspense>
  );
}
