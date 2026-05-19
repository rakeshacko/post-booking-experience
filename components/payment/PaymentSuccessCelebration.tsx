"use client";

/**
 * @deprecated Use `BookingPaymentSuccessCelebration` + `BookingPaymentSuccessNext` with the split
 * `/payment/booking-success` routes. Wrapper kept so older call sites with full props still type-check.
 */

import type { PaymentSuccessCelebrationProps } from "@/components/payment/booking-success-shared";
import { BookingPaymentSuccessCelebration } from "@/components/payment/BookingPaymentSuccessCelebration";

export type { PaymentSuccessCelebrationProps } from "@/components/payment/booking-success-shared";

export function PaymentSuccessCelebration({ subline }: PaymentSuccessCelebrationProps) {
  return <BookingPaymentSuccessCelebration subline={subline} />;
}
