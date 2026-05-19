"use client";

import { Suspense } from "react";

import { MarginMoneySlipActionScreen } from "@/components/payment/MarginMoneySlipActionScreen";

/**
 * Self finance — margin money slip download after full down payment is received.
 */
export default function MarginMoneySlipPage() {
  return (
    <Suspense fallback={null}>
      <MarginMoneySlipActionScreen />
    </Suspense>
  );
}
