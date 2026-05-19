"use client";

import { Suspense } from "react";

import { BookingPaymentSuccessCelebration } from "@/components/payment/BookingPaymentSuccessCelebration";
import { CelebrationPageTransition } from "@/components/ui/page-transition";

import { BOOKING_LOCK_AMOUNT_INR } from "@/lib/paymentUrls";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function BookingPaymentSuccessInner() {
  return (
    <CelebrationPageTransition>
      <BookingPaymentSuccessCelebration
        subline={`${formatInr(BOOKING_LOCK_AMOUNT_INR)} booking amount received`}
      />
    </CelebrationPageTransition>
  );
}

export default function BookingPaymentSuccessPage() {
  return (
    <Suspense fallback={null}>
      <BookingPaymentSuccessInner />
    </Suspense>
  );
}
