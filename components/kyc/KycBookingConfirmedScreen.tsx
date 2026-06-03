"use client";

import { useCallback, useRef } from "react";

import { BookingCelebrationSuccessScreen } from "@/components/kyc/BookingCelebrationSuccessScreen";
import { useReducedMotion } from "@/lib/animations/utils";
import { BUYING_GUIDE_ENTRY_PATH } from "@/lib/buying-guide-urls";
import { fireBasicCannon } from "@/lib/confetti-basic-cannon";
import { BOOKING_LOCK_AMOUNT_INR } from "@/lib/paymentUrls";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

type KycBookingConfirmedScreenProps = {
  /** `payment` — after booking-lock checkout; default — end of KYC processing. */
  variant?: "default" | "payment";
  /** Paid booking-lock amount from mock checkout (`?paid=`). */
  paidAmountInr?: number;
};

/**
 * Booking confirmation success — Figma Post-booking-experience / node 1880:7088.
 */
export function KycBookingConfirmedScreen({
  variant = "default",
  paidAmountInr = BOOKING_LOCK_AMOUNT_INR,
}: KycBookingConfirmedScreenProps) {
  const isPayment = variant === "payment";
  const prefersReducedMotion = useReducedMotion();
  const confettiFiredRef = useRef(false);

  const handleHeadlineReveal = useCallback(() => {
    if (!isPayment || prefersReducedMotion || confettiFiredRef.current) return;
    confettiFiredRef.current = true;
    fireBasicCannon();
  }, [isPayment, prefersReducedMotion]);

  return (
    <BookingCelebrationSuccessScreen
      headline={
        isPayment ? "Booking received" : "Your booking is confirmed with Hyundai"
      }
      belowHeadline={
        isPayment ? (
          <p className="text-base font-normal leading-6 text-[#757575]">
            Your {formatInr(paidAmountInr)} payment is confirmed.
          </p>
        ) : undefined
      }
      okayPath={isPayment ? BUYING_GUIDE_ENTRY_PATH : "/car-allocation/pending"}
      ctaLabel={isPayment ? "See what's next and get started" : "Continue"}
      upNextText={isPayment ? "Buying guide" : "Car allocation"}
      onHeadlineReveal={isPayment ? handleHeadlineReveal : undefined}
    />
  );
}
