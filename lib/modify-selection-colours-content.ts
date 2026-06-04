import {
  BOOKING_CAR_COLOR,
  BOOKING_EXPRESS_DELIVERY_LINE,
} from "@/components/kyc/booking-car-card-content";
import { BOOKING_STANDARD_DELIVERY_LINE } from "@/lib/experience-flow-content";
import {
  ON_ROAD_LIST_PRICE_INR,
  ON_ROAD_PRICE_INR,
} from "@/components/payment/loan-amount-demo-constants";

export type ModifySelectionColourOption = {
  id: string;
  name: string;
  /** CSS background for the 48×48 swatch (car paint). */
  swatchBackground: string;
  ackoDrivePriceInr: number;
  onRoadListPriceInr: number;
  deliveryLine: string;
  isExpressDelivery: boolean;
};

function colourOption(
  partial: Omit<ModifySelectionColourOption, "deliveryLine" | "isExpressDelivery"> & {
    deliveryLine?: string;
    isExpressDelivery?: boolean;
  },
): ModifySelectionColourOption {
  return {
    deliveryLine: BOOKING_EXPRESS_DELIVERY_LINE,
    isExpressDelivery: true,
    ...partial,
  };
}

/** Demo palette for Hyundai Creta — Figma colour card (2672:10452). */
export const MODIFY_SELECTION_COLOUR_OPTIONS: readonly ModifySelectionColourOption[] = [
  colourOption({
    id: "starry_night",
    name: "Starry Night",
    swatchBackground:
      "linear-gradient(145deg, #2c3e6b 0%, #141f38 45%, #0a1224 100%)",
    ackoDrivePriceInr: ON_ROAD_PRICE_INR,
    onRoadListPriceInr: ON_ROAD_LIST_PRICE_INR,
  }),
  colourOption({
    id: "atlas_white",
    name: "Atlas White",
    swatchBackground:
      "linear-gradient(160deg, #ffffff 0%, #f0f0f0 55%, #d8d8d8 100%)",
    ackoDrivePriceInr: 1_365_301,
    onRoadListPriceInr: 2_010_900,
  }),
  colourOption({
    id: "titan_grey",
    name: "Titan Grey",
    swatchBackground:
      "linear-gradient(145deg, #8a8a8a 0%, #5c5c5c 50%, #3d3d3d 100%)",
    ackoDrivePriceInr: 1_368_450,
    onRoadListPriceInr: 2_015_200,
    deliveryLine: BOOKING_STANDARD_DELIVERY_LINE,
    isExpressDelivery: false,
  }),
  colourOption({
    id: "abyss_black",
    name: "Abyss Black",
    swatchBackground:
      "linear-gradient(145deg, #3a3a3a 0%, #1a1a1a 55%, #050505 100%)",
    ackoDrivePriceInr: 1_371_890,
    onRoadListPriceInr: 2_018_600,
  }),
  colourOption({
    id: "deep_forest",
    name: "Robust Emerald Pearl",
    swatchBackground:
      "linear-gradient(145deg, #3d5c4a 0%, #2a4035 45%, #1a2820 100%)",
    ackoDrivePriceInr: 1_369_650,
    onRoadListPriceInr: 2_014_900,
    deliveryLine: BOOKING_STANDARD_DELIVERY_LINE,
    isExpressDelivery: false,
  }),
] as const;

export { MODIFY_SELECTION_CURRENT_SELECTION_HEADING } from "@/lib/modify-selection-content";

export const MODIFY_SELECTION_AVAILABLE_COLOURS_HEADING = "Available colours";

/** Page title on `/kyc/modify-selection/colour`. */
export const MODIFY_SELECTION_COLOUR_SCREEN_TITLE = "Which colour would you like?";

/** Delivery option sheet — Figma 2674:8617. */
export const MODIFY_SELECTION_DELIVERY_SHEET_TITLE = "How soon do you want it?";

/** Standard line on the delivery sheet (may differ from car-card standard copy). */
export const MODIFY_SELECTION_SHEET_STANDARD_DELIVERY_LINE =
  "Standard delivery by 20 Oct '26";

export const MODIFY_SELECTION_EXPRESS_EXTRA_CHARGE_INR = 4_999;

export type ModifySelectionDeliveryChoice = "express" | "standard";

/** Express delivery price on colour cards when `isExpressDelivery` is true. */
export function modifySelectionStandardDeliveryPriceInr(
  expressDeliveryPriceInr: number,
): number {
  return Math.max(0, expressDeliveryPriceInr - MODIFY_SELECTION_EXPRESS_EXTRA_CHARGE_INR);
}

/** When the card shows standard delivery price, express is this much higher. */
export function modifySelectionExpressDeliveryPriceInr(standardDeliveryPriceInr: number): number {
  return standardDeliveryPriceInr + MODIFY_SELECTION_EXPRESS_EXTRA_CHARGE_INR;
}

/** Review screen — `/kyc/modify-selection/colour/confirm`. */
export const MODIFY_SELECTION_COLOUR_CONFIRM_PATH = "/kyc/modify-selection/colour/confirm";

export {
  MODIFY_SELECTION_REVIEW_PAY_TITLE as MODIFY_SELECTION_COLOUR_CONFIRM_TITLE,
} from "@/lib/modify-selection-review-pay-content";

export const MODIFY_SELECTION_COLOUR_CONFIRM_SUBLINE =
  "Your ₹10,000 booking amount will carry forward to your new selection. Delivery date may change depending on the colour you pick.";

export const MODIFY_SELECTION_COLOUR_CONFIRM_PAY_CTA = "Pay";

export function resolveModifySelectionColourQuote(
  option: ModifySelectionColourOption,
  deliveryChoice: ModifySelectionDeliveryChoice,
): {
  deliveryLine: string;
  ackoDrivePriceInr: number;
  isExpressDelivery: boolean;
} {
  if (deliveryChoice === "express") {
    return {
      deliveryLine: option.deliveryLine,
      ackoDrivePriceInr: option.isExpressDelivery
        ? option.ackoDrivePriceInr
        : modifySelectionExpressDeliveryPriceInr(option.ackoDrivePriceInr),
      isExpressDelivery: true,
    };
  }

  return {
    deliveryLine: option.isExpressDelivery
      ? MODIFY_SELECTION_SHEET_STANDARD_DELIVERY_LINE
      : option.deliveryLine,
    ackoDrivePriceInr: option.isExpressDelivery
      ? modifySelectionStandardDeliveryPriceInr(option.ackoDrivePriceInr)
      : option.ackoDrivePriceInr,
    isExpressDelivery: false,
  };
}

export function findModifySelectionColourOption(
  colourId: string,
): ModifySelectionColourOption | undefined {
  return MODIFY_SELECTION_COLOUR_OPTIONS.find((option) => option.id === colourId);
}

/** Colours the user can switch to — excludes the currently booked paint. */
export function getModifySelectionAvailableColourOptions(): ModifySelectionColourOption[] {
  return MODIFY_SELECTION_COLOUR_OPTIONS.filter((option) => option.name !== BOOKING_CAR_COLOR);
}

export function modifySelectionColourSavingsInr(option: ModifySelectionColourOption): number {
  return Math.max(0, option.onRoadListPriceInr - option.ackoDrivePriceInr);
}
