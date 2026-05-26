"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { BOOKING_LOCK_SUCCESS_PATH } from "@/lib/paymentUrls";

/** Legacy — booking-lock success now lives at `/kyc/booking-confirmed?source=payment`. */
export default function LegacyBookingSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace(BOOKING_LOCK_SUCCESS_PATH);
  }, [router]);

  return null;
}
