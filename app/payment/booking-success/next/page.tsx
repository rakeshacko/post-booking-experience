"use client";

import { Suspense } from "react";

import { BOOKING_PAYMENT_SUCCESS_PHASE2_DEFAULTS } from "@/components/payment/booking-success-shared";
import { BookingPaymentSuccessNext } from "@/components/payment/BookingPaymentSuccessNext";

function BookingPaymentSuccessNextInner() {
  return (
    <BookingPaymentSuccessNext
      upNextDetail={BOOKING_PAYMENT_SUCCESS_PHASE2_DEFAULTS.upNextDetail}
      ctaLabel={BOOKING_PAYMENT_SUCCESS_PHASE2_DEFAULTS.ctaLabel}
      ctaHref={BOOKING_PAYMENT_SUCCESS_PHASE2_DEFAULTS.ctaHref}
    />
  );
}

export default function BookingPaymentSuccessNextPage() {
  return (
    <Suspense fallback={null}>
      <BookingPaymentSuccessNextInner />
    </Suspense>
  );
}
