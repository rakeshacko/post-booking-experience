import {
  BOOKING_CAR_COLOR,
  BOOKING_CAR_TITLE,
  BOOKING_CAR_VARIANT,
} from "@/components/kyc/booking-car-card-content";
import { readActiveBookingSnapshot } from "@/lib/active-booking-snapshot";
import {
  getBookingDeliveryLine,
  isStandardDeliveryFlow,
} from "@/lib/experience-flow-content";
import { BOOKING_LOCK_AMOUNT_INR } from "@/lib/paymentUrls";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export const CANCEL_BOOKING_CONFIRM_OVERLINE = "Are you sure you want to cancel?";

export const CANCEL_BOOKING_MODIFY_PROMPT = "Not happy with your selection?";

export const CANCEL_BOOKING_MODIFY_CTA = "Modify my booking";

export const CANCEL_BOOKING_STILL_CANCEL_PROMPT = "Still want to cancel?";

export const CANCEL_BOOKING_CONFIRM_CTA = "Yes, cancel my booking";

export const CANCEL_BOOKING_REASON_SHEET_TITLE =
  "Before you go — tell me what went wrong?";

export const CANCEL_BOOKING_REASON_SHEET_CTA = "Yes, cancel it";

export type CancelBookingReasonId =
  | "better_deal"
  | "changed_mind"
  | "financial"
  | "delivery_timeline"
  | "unhappy_process"
  | "other";

export type CancelBookingReasonOption = {
  id: CancelBookingReasonId;
  label: string;
};

export const CANCEL_BOOKING_REASON_OPTIONS: readonly CancelBookingReasonOption[] = [
  { id: "better_deal", label: "Found a better deal elsewhere" },
  { id: "changed_mind", label: "Changed my mind about the car" },
  { id: "financial", label: "Financial reasons" },
  { id: "delivery_timeline", label: "Delivery timeline is too long" },
  { id: "unhappy_process", label: "Unhappy with the process" },
  { id: "other", label: "Other" },
] as const;

export const CANCEL_BOOKING_SUCCESS_HREF = "/kyc/cancel-booking/success";

export const CANCEL_BOOKING_REFUND_BOOKING_AMOUNT_LABEL = "Booking amount";

export const CANCEL_BOOKING_REFUND_CANCELLATION_FEE_LABEL = "Cancellation fee";

export const CANCEL_BOOKING_REFUND_AMOUNT_LABEL = "Refund amount";

export const CANCEL_BOOKING_REFUND_TIMELINE =
  "You'll get your refund in 5-7 business days";

export type CancelBookingCarDetails = {
  carTitle: string;
  carVariant: string;
  carColor: string;
  deliveryLine: string;
  isExpressDelivery: boolean;
  colourId?: string;
};

export function resolveCancelBookingHeadline(): string {
  const snapshot = readActiveBookingSnapshot();
  const title = snapshot?.carTitle ?? BOOKING_CAR_TITLE;
  const model = title.replace(/^Hyundai\s+/i, "").trim() || "Creta";
  return `You have come a long way to get your ${model}`;
}

export function resolveCancelBookingCarDetails(): CancelBookingCarDetails {
  const snapshot = readActiveBookingSnapshot();
  if (snapshot != null) {
    return {
      carTitle: snapshot.carTitle ?? BOOKING_CAR_TITLE,
      carVariant: snapshot.carVariant ?? BOOKING_CAR_VARIANT,
      carColor: snapshot.colourName,
      deliveryLine: snapshot.deliveryLine,
      isExpressDelivery: snapshot.isExpressDelivery,
      colourId: snapshot.colourId,
    };
  }

  const isStandard = isStandardDeliveryFlow();

  return {
    carTitle: BOOKING_CAR_TITLE,
    carVariant: BOOKING_CAR_VARIANT,
    carColor: BOOKING_CAR_COLOR,
    deliveryLine: getBookingDeliveryLine(),
    isExpressDelivery: !isStandard,
  };
}

export function cancelBookingRefundBookingAmountInr(): number {
  return BOOKING_LOCK_AMOUNT_INR;
}

export function cancelBookingRefundCancellationFeeDisplay(): string {
  return "0";
}

export function cancelBookingRefundAmountInr(): number {
  return BOOKING_LOCK_AMOUNT_INR;
}

export function formatCancelBookingInr(amount: number): string {
  return formatInr(amount);
}
