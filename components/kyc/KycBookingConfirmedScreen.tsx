"use client";

import { BookingCelebrationSuccessScreen } from "@/components/kyc/BookingCelebrationSuccessScreen";

const USER_NAME = "Sharath";

/**
 * Booking confirmation success — Figma Post-booking-experience / node 1880:7088.
 */
export function KycBookingConfirmedScreen() {
  return (
    <BookingCelebrationSuccessScreen
      headline={`Your booking is confirmed, ${USER_NAME}!`}
      okayPath="/car-allocation/pending"
    />
  );
}
