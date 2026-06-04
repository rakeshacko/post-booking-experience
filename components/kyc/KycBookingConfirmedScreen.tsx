"use client";

import { useCallback, useMemo, useRef } from "react";

import { BookingCarSummaryCard } from "@/components/kyc/BookingCarSummaryCard";
import { BookingCelebrationSuccessScreen } from "@/components/kyc/BookingCelebrationSuccessScreen";
import { useReducedMotion } from "@/lib/animations/utils";
import {
  activeBookingCardDetails,
  activeBookingCarCutoutSrc,
  type ActiveBookingSnapshot,
} from "@/lib/active-booking-snapshot";
import { BUYING_GUIDE_ENTRY_PATH } from "@/lib/buying-guide-urls";
import { isModifyWithChargesFlow } from "@/lib/experience-flow";
import { fireBasicCannon } from "@/lib/confetti-basic-cannon";
import { JOURNEY_PATHS } from "@/lib/journey-routes";
import { MODIFY_SELECTION_NEW_BOOKING_AMOUNT_INR } from "@/lib/modify-selection-review-pay-content";
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
  /** Modify-selection pay — “Booking received” UI with updated car; CTA varies by experience flow. */
  afterModifySelection?: boolean;
  activeBooking?: ActiveBookingSnapshot | null;
};

/**
 * Booking confirmation success — Figma Post-booking-experience / node 1880:7088.
 */
export function KycBookingConfirmedScreen({
  variant = "default",
  paidAmountInr = BOOKING_LOCK_AMOUNT_INR,
  afterModifySelection = false,
  activeBooking = null,
}: KycBookingConfirmedScreenProps) {
  const isPayment = variant === "payment";
  const prefersReducedMotion = useReducedMotion();
  const confettiFiredRef = useRef(false);

  const handleHeadlineReveal = useCallback(() => {
    if (!isPayment || prefersReducedMotion || confettiFiredRef.current) return;
    confettiFiredRef.current = true;
    fireBasicCannon();
  }, [isPayment, prefersReducedMotion]);

  const replaceCarCardWith = useMemo(() => {
    if (!afterModifySelection || activeBooking == null) return undefined;
    return (
      <BookingCarSummaryCard
        key={`${activeBooking.colourId}-${activeBooking.carTitle ?? ""}-${activeBooking.carVariant ?? ""}`}
        variant="hero"
        carCutoutSrc={activeBookingCarCutoutSrc(activeBooking)}
        cardDetails={activeBookingCardDetails(activeBooking)}
      />
    );
  }, [activeBooking, afterModifySelection]);

  const afterModifyWithCharges =
    afterModifySelection && isModifyWithChargesFlow();

  const okayPath = isPayment
    ? afterModifyWithCharges
      ? JOURNEY_PATHS.kyc.processing
      : afterModifySelection
        ? JOURNEY_PATHS.kyc.hub
        : BUYING_GUIDE_ENTRY_PATH
    : "/car-allocation/pending";

  const ctaLabel = isPayment
    ? afterModifyWithCharges
      ? "Continue"
      : afterModifySelection
        ? "Continue to verification"
        : "See what's next and get started"
    : "Continue";

  const upNextText = isPayment
    ? afterModifyWithCharges
      ? undefined
      : afterModifySelection
        ? "Verify your identity"
        : "Buying guide"
    : "Car allocation";

  const paymentConfirmedAmountInr = afterModifySelection
    ? (activeBooking?.newBookingAmountInr ?? MODIFY_SELECTION_NEW_BOOKING_AMOUNT_INR)
    : paidAmountInr;

  return (
    <BookingCelebrationSuccessScreen
      headline={
        isPayment ? "Booking received" : "Your booking is confirmed with Hyundai"
      }
      belowHeadline={
        isPayment ? (
          <p className="text-base font-normal leading-6 text-[#757575]">
            Your {formatInr(paymentConfirmedAmountInr)} payment is confirmed.
          </p>
        ) : undefined
      }
      replaceCarCardWith={replaceCarCardWith}
      holdCarCardUntilCustom={afterModifySelection && activeBooking == null}
      okayPath={okayPath}
      ctaLabel={ctaLabel}
      upNextText={upNextText}
      onHeadlineReveal={isPayment ? handleHeadlineReveal : undefined}
    />
  );
}
