import type { StaticImageData } from "next/image";

import cretaAbyssBlack from "@/assets/Creta_Abyss black.png";
import cretaAtlasWhite from "@/assets/Creta_Atlas white.png";
import cretaRobustEmeraldPearl from "@/assets/Creta_Robust Emerald Pearl.png";
import cretaTitanGrey from "@/assets/Creta_Titan grey.png";
import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";

const MODIFY_SELECTION_CAR_CUTOUT_BY_COLOUR_ID: Record<string, StaticImageData> = {
  atlas_white: cretaAtlasWhite,
  titan_grey: cretaTitanGrey,
  abyss_black: cretaAbyssBlack,
  deep_forest: cretaRobustEmeraldPearl,
};

/** Hero car cutout for modify-selection confirm screens — keyed by colour option id. */
export function getModifySelectionCarCutoutForColour(
  colourId: string,
): StaticImageData | string {
  return MODIFY_SELECTION_CAR_CUTOUT_BY_COLOUR_ID[colourId] ?? BOOKING_CONFIRMED_ASSETS.carCutout;
}
