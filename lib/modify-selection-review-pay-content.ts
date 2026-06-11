import { readChangeEntryStage } from "@/lib/change-policy";
import { isModifyWithChargesFlow } from "@/lib/experience-flow";
import type { ModifySelectionColourOption } from "@/lib/modify-selection-colours-content";
import {
  resolveModifySelectionColourQuote,
  type ModifySelectionDeliveryChoice,
} from "@/lib/modify-selection-colours-content";
import { MODIFY_BOOKING_CHANGE_FEE_INR } from "@/lib/manage-booking-modify";

/** Paid at booking lock — demo (Figma 2696:9166). */
export const MODIFY_SELECTION_BOOKING_AMOUNT_PAID_INR = 10_000;

/** New booking lock for the updated selection — demo (Figma 2696:9233). */
export const MODIFY_SELECTION_NEW_BOOKING_AMOUNT_INR = 15_000;

export const MODIFY_SELECTION_REVIEW_PAY_TITLE = "Review and pay the booking amount";

/** Price summary demo totals — Figma 2699:9390. */
export const MODIFY_SELECTION_PRICE_SUMMARY_DEMO = {
  exShowroomPriceInr: 2_016_300,
  otherChargesTotalInr: 1_365_301,
  totalDiscountInr: 104_871,
  ackoDriveDiscountInr: 69_701,
  ackoDrivePriceInr: 2_256_565,
} as const;

/** Demo line items inside “Other charges” (Figma 2699:9401). */
export const MODIFY_SELECTION_OTHER_CHARGES_LINE_ITEMS: readonly {
  label: string;
  amountInr: number;
}[] = [
  { label: "Registration amount", amountInr: 254_693 },
  { label: "Dealer Insurance premium", amountInr: 64_880 },
  { label: "Tax collected at source", amountInr: 20_163 },
  { label: "FasTag", amountInr: 850 },
  { label: "HSRP number plate charges", amountInr: 850 },
] as const;

export type ModifySelectionReviewPaySummary = {
  exShowroomPriceInr: number;
  otherChargesTotalInr: number;
  ackoDrivePriceInr: number;
  ackoDriveDiscountInr: number;
  totalDiscountInr: number;
  newBookingAmountInr: number;
  bookingAmountPaidInr: number;
  /** ₹5,000 when {@link isModifyWithChargesFlow} — booking change fee (50% of lock). */
  changeSelectionFeeInr: number;
  bookingAmountToPayInr: number;
  deliveryLine: string;
  isExpressDelivery: boolean;
};

export function buildModifySelectionColourReviewPaySummary(
  option: ModifySelectionColourOption,
  deliveryChoice: ModifySelectionDeliveryChoice,
): ModifySelectionReviewPaySummary {
  const quote = resolveModifySelectionColourQuote(option, deliveryChoice);
  const { exShowroomPriceInr, otherChargesTotalInr, totalDiscountInr, ackoDriveDiscountInr, ackoDrivePriceInr } =
    MODIFY_SELECTION_PRICE_SUMMARY_DEMO;

  const newBookingAmountInr = MODIFY_SELECTION_NEW_BOOKING_AMOUNT_INR;
  const bookingAmountPaidInr = MODIFY_SELECTION_BOOKING_AMOUNT_PAID_INR;
  // ₹5,000 one-time change fee applies after Booking Confirmation (policy §1.9):
  // modify-with-charges demo flow, or express/standard entering post-lock.
  const changeSelectionFeeInr =
    isModifyWithChargesFlow() || readChangeEntryStage() === "post"
      ? MODIFY_BOOKING_CHANGE_FEE_INR
      : 0;
  const bookingAmountToPayInr =
    Math.max(0, newBookingAmountInr - bookingAmountPaidInr) + changeSelectionFeeInr;

  return {
    exShowroomPriceInr,
    otherChargesTotalInr,
    ackoDrivePriceInr,
    ackoDriveDiscountInr,
    totalDiscountInr,
    newBookingAmountInr,
    bookingAmountPaidInr,
    changeSelectionFeeInr,
    bookingAmountToPayInr,
    deliveryLine: quote.deliveryLine,
    isExpressDelivery: quote.isExpressDelivery,
  };
}

export function formatModifySelectionInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

export function formatModifySelectionInrSigned(amount: number): string {
  const formatted = formatModifySelectionInr(Math.abs(amount));
  if (amount < 0) return `-${formatted}`;
  return formatted;
}
