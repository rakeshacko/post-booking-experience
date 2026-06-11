import { BOOKING_LOCK_AMOUNT_INR } from "@/lib/paymentUrls";
import { isCancelNoChargesFlow, isModifyNoChargesFlow } from "@/lib/experience-flow";
import {
  isIdentityFunnelPhase,
  normalizeAppPathname,
  resolveJourneyPhase,
} from "@/lib/journey-routes";

export { normalizeAppPathname };

/** 50% of booking lock — show amount in copy, not percentage. */
export const MODIFY_BOOKING_CANCEL_FEE_INR = BOOKING_LOCK_AMOUNT_INR / 2;

export const MODIFY_BOOKING_CHANGE_FEE_INR = 5_000;

export type ModifyBookingFeeTier = "free" | "standard";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Free fees on the identity funnel through `/kyc/processing` (inclusive).
 * Standard from `/kyc/booking-accepted` through pay-down-payment until DP is on the URL.
 */
export function resolveModifyBookingFeeTier(pathname: string): ModifyBookingFeeTier {
  if (isModifyNoChargesFlow() || isCancelNoChargesFlow()) {
    return "free";
  }
  const phase = resolveJourneyPhase(pathname);
  return isIdentityFunnelPhase(phase) ? "free" : "standard";
}

export function modifyBookingCancelDescription(tier: ModifyBookingFeeTier): string {
  return tier === "free"
    ? "Free — everything you've paid comes back"
    : "50% of everything you've paid is retained";
}

export function modifyBookingChangeDescription(tier: ModifyBookingFeeTier): string {
  return tier === "free"
    ? "No change fee"
    : `A change fee of ${formatInr(MODIFY_BOOKING_CHANGE_FEE_INR)} is applicable.`;
}
