import type { StaticImageData } from "next/image";

import hondaLogo from "@/assets/car brands/Honda.svg";
import hyundaiLogo from "@/assets/car brands/Hyundai.svg";
import kiaLogo from "@/assets/car brands/Kia.svg";
import mahindraLogo from "@/assets/car brands/Mahindra.svg";
import mgLogo from "@/assets/car brands/MG.svg";
import renaultLogo from "@/assets/car brands/Renault.svg";
import skodaLogo from "@/assets/car brands/Skoda.svg";
import suzukiLogo from "@/assets/car brands/Suzuki.svg";
import tataLogo from "@/assets/car brands/TATA.svg";
import toyotaLogo from "@/assets/car brands/Toyota.svg";
import volkswagenLogo from "@/assets/car brands/Volkswagen.svg";

export const MODIFY_SELECTION_CAR_BRAND_PATH = "/kyc/modify-selection/different-car";

/** Figma 2686:11633 — car brand picker after “Agree and continue”. */
export const MODIFY_SELECTION_CAR_BRAND_SCREEN_TITLE =
  "Which car brand are you looking for?";

export type ModifySelectionCarBrandOption = {
  id: string;
  name: string;
  logoSrc: StaticImageData;
};

/** Grid order matches Figma 2686:11633 (3 columns, row-major). */
export const MODIFY_SELECTION_CAR_BRAND_OPTIONS: readonly ModifySelectionCarBrandOption[] =
  [
    { id: "maruti_suzuki", name: "Maruti Suzuki", logoSrc: suzukiLogo },
    { id: "hyundai", name: "Hyundai", logoSrc: hyundaiLogo },
    { id: "tata", name: "Tata", logoSrc: tataLogo },
    { id: "mahindra", name: "Mahindra", logoSrc: mahindraLogo },
    { id: "toyota", name: "Toyota", logoSrc: toyotaLogo },
    { id: "kia", name: "Kia", logoSrc: kiaLogo },
    { id: "honda", name: "Honda", logoSrc: hondaLogo },
    { id: "mg", name: "MG", logoSrc: mgLogo },
    { id: "volkswagen", name: "Volkswagen", logoSrc: volkswagenLogo },
    { id: "skoda", name: "Skoda", logoSrc: skodaLogo },
    { id: "renault", name: "Renault", logoSrc: renaultLogo },
  ] as const;

export function getModifySelectionCarBrandById(
  brandId: string,
): ModifySelectionCarBrandOption | undefined {
  return MODIFY_SELECTION_CAR_BRAND_OPTIONS.find((brand) => brand.id === brandId);
}
