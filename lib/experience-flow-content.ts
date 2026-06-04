import timeDeliveryIcon from "@/assets/Time.svg";
import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";
import { BOOKING_EXPRESS_DELIVERY_LINE } from "@/components/kyc/booking-car-card-content";
import {
  readExperienceFlow,
  type ExperienceFlow,
} from "@/lib/experience-flow";

/** Standard delivery — update when product copy is final. */
export const BOOKING_STANDARD_DELIVERY_LINE = "Standard delivery by 25 Oct '26";

/** Delivery line colour on car cards — standard vs express. */
export const BOOKING_STANDARD_DELIVERY_TEXT_CLASS = "text-[#4B4B4B]";
export const BOOKING_EXPRESS_DELIVERY_TEXT_CLASS = "text-[#5920c5]";

const BOOKING_DELIVERY_LINE_BY_DATE = /^(.*? by )(.+)$/;

/** Splits copy like `Express delivery by 10 Jun '25` into prefix + date. */
export function splitBookingDeliveryLine(
  deliveryLine: string,
): { prefix: string; date: string } | null {
  const match = deliveryLine.match(BOOKING_DELIVERY_LINE_BY_DATE);
  if (!match) return null;
  return { prefix: match[1], date: match[2] };
}

export function isStandardDeliveryFlow(flow?: ExperienceFlow): boolean {
  const active = flow ?? readExperienceFlow();
  return active === "standard";
}

export function isExpressDeliveryFlow(flow?: ExperienceFlow): boolean {
  const active = flow ?? readExperienceFlow();
  return active === "express";
}

/** Delivery line on car cards — standard-only vs express (default for other flows). */
export function getBookingDeliveryLine(flow?: ExperienceFlow): string {
  return isStandardDeliveryFlow(flow)
    ? BOOKING_STANDARD_DELIVERY_LINE
    : BOOKING_EXPRESS_DELIVERY_LINE;
}

/** Delivery icon on car cards — standard uses clock; express uses bolt. */
export function getBookingDeliveryIconSrc(flow?: ExperienceFlow) {
  return isStandardDeliveryFlow(flow)
    ? timeDeliveryIcon
    : BOOKING_CONFIRMED_ASSETS.expressDelivery;
}

/** Tailwind text colour for the delivery line on car cards. */
export function getBookingDeliveryTextClass(flow?: ExperienceFlow): string {
  return isStandardDeliveryFlow(flow)
    ? BOOKING_STANDARD_DELIVERY_TEXT_CLASS
    : BOOKING_EXPRESS_DELIVERY_TEXT_CLASS;
}

const CAR_ALLOCATION_PENDING_SUBLINE_BASE =
  "We are working with Advaith Hyundai to allocate your exact Creta variant and colour.";

/** Express / default — includes timing estimate. */
export const CAR_ALLOCATION_PENDING_SUBLINE_EXPRESS = `${CAR_ALLOCATION_PENDING_SUBLINE_BASE} This usually takes 24-48 hours.`;

/** Standard delivery — no timing line on car allocation pending. */
export const CAR_ALLOCATION_PENDING_SUBLINE_STANDARD = CAR_ALLOCATION_PENDING_SUBLINE_BASE;

export function getCarAllocationPendingSubline(flow?: ExperienceFlow): string {
  return isStandardDeliveryFlow(flow)
    ? CAR_ALLOCATION_PENDING_SUBLINE_STANDARD
    : CAR_ALLOCATION_PENDING_SUBLINE_EXPRESS;
}

/** Info callout on car allocation pending — express / default. */
export const CAR_ALLOCATION_PENDING_INFO_BOX_EXPRESS =
  "Once allocated, you will receive your car's engine and chassis number.";

/** Standard delivery — allocation-by date shown with emphasis in the info callout. */
export const CAR_ALLOCATION_PENDING_ALLOCATION_BY_DATE = "5 Jun 2026";

/** Car allocation pending summary card — standard delivery only. */
export const CAR_ALLOCATION_PENDING_SUMMARY_LABEL_STANDARD = "Car allocation by";
export const CAR_ALLOCATION_PENDING_SUMMARY_DESCRIPTION_STANDARD =
  "You'll receive the engine and chassis number once it's confirmed.";
