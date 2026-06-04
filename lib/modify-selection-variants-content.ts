import { BOOKING_CAR_VARIANT, BOOKING_EXPRESS_DELIVERY_LINE } from "@/components/kyc/booking-car-card-content";
import { BOOKING_STANDARD_DELIVERY_LINE } from "@/lib/experience-flow-content";
import {
  MODIFY_SELECTION_EXPRESS_EXTRA_CHARGE_INR,
  MODIFY_SELECTION_SHEET_STANDARD_DELIVERY_LINE,
  modifySelectionExpressDeliveryPriceInr,
  modifySelectionStandardDeliveryPriceInr,
  type ModifySelectionDeliveryChoice,
} from "@/lib/modify-selection-colours-content";
import {
  ON_ROAD_LIST_PRICE_INR,
  ON_ROAD_PRICE_INR,
} from "@/components/payment/loan-amount-demo-constants";

export type ModifySelectionVariantFuel = "petrol" | "diesel";
export type ModifySelectionVariantTransmission = "manual" | "automatic";

export type ModifySelectionVariantOption = {
  id: string;
  name: string;
  fuel: ModifySelectionVariantFuel;
  transmission: ModifySelectionVariantTransmission;
  mileageLabel: string;
  ackoDrivePriceInr: number;
  onRoadListPriceInr: number;
  deliveryLine: string;
  isExpressDelivery: boolean;
};

export type ModifySelectionVariantFilters = {
  fuel: ModifySelectionVariantFuel | null;
  transmission: ModifySelectionVariantTransmission | null;
};

function variantOption(
  partial: Omit<ModifySelectionVariantOption, "deliveryLine" | "isExpressDelivery"> & {
    deliveryLine?: string;
    isExpressDelivery?: boolean;
  },
): ModifySelectionVariantOption {
  return {
    deliveryLine: BOOKING_EXPRESS_DELIVERY_LINE,
    isExpressDelivery: true,
    ...partial,
  };
}

/** Demo variants for Hyundai Creta — Figma 2682:9105. */
export const MODIFY_SELECTION_VARIANT_OPTIONS: readonly ModifySelectionVariantOption[] = [
  variantOption({
    id: "e_petrol_mt",
    name: "E 1.5 Petrol MT",
    fuel: "petrol",
    transmission: "manual",
    mileageLabel: "17.4 kmpl",
    ackoDrivePriceInr: ON_ROAD_PRICE_INR - 120_000,
    onRoadListPriceInr: ON_ROAD_LIST_PRICE_INR - 95_000,
  }),
  variantOption({
    id: "ex_petrol_mt",
    name: "EX 1.5 Petrol MT",
    fuel: "petrol",
    transmission: "manual",
    mileageLabel: "17.4 kmpl",
    ackoDrivePriceInr: ON_ROAD_PRICE_INR - 45_000,
    onRoadListPriceInr: ON_ROAD_LIST_PRICE_INR - 30_000,
  }),
  variantOption({
    id: "s_diesel_mt",
    name: "S (O) 1.5 Diesel MT",
    fuel: "diesel",
    transmission: "manual",
    mileageLabel: "21.4 kmpl",
    ackoDrivePriceInr: ON_ROAD_PRICE_INR,
    onRoadListPriceInr: ON_ROAD_LIST_PRICE_INR,
    deliveryLine: BOOKING_STANDARD_DELIVERY_LINE,
    isExpressDelivery: false,
  }),
  variantOption({
    id: "sx_diesel_at",
    name: "SX 1.5 Diesel AT",
    fuel: "diesel",
    transmission: "automatic",
    mileageLabel: "19.4 kmpl",
    ackoDrivePriceInr: ON_ROAD_PRICE_INR + 85_000,
    onRoadListPriceInr: ON_ROAD_LIST_PRICE_INR + 110_000,
    deliveryLine: MODIFY_SELECTION_SHEET_STANDARD_DELIVERY_LINE,
    isExpressDelivery: false,
  }),
  variantOption({
    id: "sx_o_turbo_dct",
    name: "SX(O) 1.5 Turbo Petrol DCT",
    fuel: "petrol",
    transmission: "automatic",
    mileageLabel: "18.0 kmpl",
    ackoDrivePriceInr: ON_ROAD_PRICE_INR + 145_000,
    onRoadListPriceInr: ON_ROAD_LIST_PRICE_INR + 185_000,
  }),
  variantOption({
    id: "xline_at_diesel",
    name: BOOKING_CAR_VARIANT,
    fuel: "diesel",
    transmission: "automatic",
    mileageLabel: "19.4 kmpl",
    ackoDrivePriceInr: ON_ROAD_PRICE_INR + 210_000,
    onRoadListPriceInr: ON_ROAD_LIST_PRICE_INR + 255_000,
  }),
] as const;

export const MODIFY_SELECTION_VARIANT_SCREEN_TITLE = "Which variant would you like?";

export const MODIFY_SELECTION_AVAILABLE_VARIANTS_HEADING = "Other available variants";

/** Colour step after picking a variant — `/kyc/modify-selection/variant/colour`. */
export const MODIFY_SELECTION_VARIANT_COLOUR_PATH = "/kyc/modify-selection/variant/colour";

export function modifySelectionVariantColourScreenTitle(variantName: string): string {
  return `Choose colour for ${variantName}`;
}

export const MODIFY_SELECTION_VARIANT_CONFIRM_PATH = "/kyc/modify-selection/variant/confirm";

export const MODIFY_SELECTION_VARIANT_CONFIRM_TITLE = "Confirm your selection";

export const MODIFY_SELECTION_VARIANT_CONFIRM_SUBLINE =
  "Your ₹10,000 booking amount will be adjusted against your new booking. Delivery date may change based on the variant you pick.";

export const MODIFY_SELECTION_VARIANT_CONFIRM_CTA = "Confirm change";

export function formatModifySelectionVariantSpecs(option: ModifySelectionVariantOption): string {
  const fuelLabel = option.fuel === "petrol" ? "Petrol" : "Diesel";
  const transmissionLabel = option.transmission === "manual" ? "Manual" : "Automatic";
  return `${fuelLabel} • ${transmissionLabel} • ${option.mileageLabel}`;
}

export function modifySelectionVariantSavingsInr(option: ModifySelectionVariantOption): number {
  return Math.max(0, option.onRoadListPriceInr - option.ackoDrivePriceInr);
}

export function filterModifySelectionVariants(
  options: readonly ModifySelectionVariantOption[],
  filters: ModifySelectionVariantFilters,
): ModifySelectionVariantOption[] {
  return options.filter((option) => {
    if (filters.fuel != null && option.fuel !== filters.fuel) return false;
    if (filters.transmission != null && option.transmission !== filters.transmission) return false;
    return true;
  });
}

export function getModifySelectionAvailableVariantOptions(): ModifySelectionVariantOption[] {
  return MODIFY_SELECTION_VARIANT_OPTIONS.filter((option) => option.id !== "xline_at_diesel");
}

export function findModifySelectionVariantOption(
  variantId: string,
): ModifySelectionVariantOption | undefined {
  return MODIFY_SELECTION_VARIANT_OPTIONS.find((option) => option.id === variantId);
}

export function resolveModifySelectionVariantQuote(
  option: ModifySelectionVariantOption,
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

export { MODIFY_SELECTION_EXPRESS_EXTRA_CHARGE_INR };
