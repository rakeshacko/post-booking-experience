"use client";

import { Suspense } from "react";

import { PayInsurancePremiumScreen } from "@/components/payment/PayInsurancePremiumScreen";

/** Full payment and loan — fixed insurance premium before car insurance prep. */
export default function PayInsurancePremiumPage() {
  return (
    <Suspense fallback={null}>
      <PayInsurancePremiumScreen />
    </Suspense>
  );
}
