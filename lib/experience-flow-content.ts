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
