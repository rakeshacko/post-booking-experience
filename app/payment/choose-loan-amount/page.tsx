"use client";

import { Suspense } from "react";

import { ChooseLoanAmountScreen } from "@/components/payment/ChooseLoanAmountScreen";

/**
 * Post–loan-sanction: choose loan amount (Figma 2111:7963 — down payment slider, on-road summary).
 */
export default function ChooseLoanAmountPage() {
  return (
    <Suspense fallback={null}>
      <ChooseLoanAmountScreen />
    </Suspense>
  );
}
