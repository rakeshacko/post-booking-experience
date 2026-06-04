import type { StaticImageData } from "next/image";

import cretaPlaceholder from "@/assets/Creta_Atlas white.png";

import { MODIFY_SELECTION_CAR_BRAND_OPTIONS } from "@/lib/modify-selection-car-brands-content";

export type ModifySelectionCarModelOption = {
  id: string;
  /** Display name in the list (e.g. “Creta”, “Seltos”). */
  name: string;
  thumbnailSrc: StaticImageData;
};

/** Demo thumbnail until per-model images are available. */
const DEFAULT_THUMBNAIL = cretaPlaceholder;

/** Demo models per brand — Figma 2686:11003. */
const MODIFY_SELECTION_CAR_MODELS_BY_BRAND_ID: Record<
  string,
  readonly Omit<ModifySelectionCarModelOption, "thumbnailSrc">[]
> = {
  hyundai: [
    { id: "creta", name: "Creta" },
    { id: "venue", name: "Venue" },
    { id: "exter", name: "Exter" },
    { id: "i20", name: "i20" },
    { id: "verna", name: "Verna" },
    { id: "tucson", name: "Tucson" },
  ],
  kia: [
    { id: "seltos", name: "Seltos" },
    { id: "sonet", name: "Sonet" },
    { id: "carens", name: "Carens" },
    { id: "ev6", name: "EV6" },
    { id: "syros", name: "Syros" },
  ],
  maruti_suzuki: [
    { id: "swift", name: "Swift" },
    { id: "baleno", name: "Baleno" },
    { id: "brezza", name: "Brezza" },
    { id: "fronx", name: "Fronx" },
    { id: "grand_vitara", name: "Grand Vitara" },
    { id: "eeco", name: "Eeco" },
  ],
  tata: [
    { id: "nexon", name: "Nexon" },
    { id: "punch", name: "Punch" },
    { id: "harrier", name: "Harrier" },
    { id: "safari", name: "Safari" },
    { id: "tiago", name: "Tiago" },
  ],
  mahindra: [
    { id: "xuv700", name: "XUV700" },
    { id: "scorpio_n", name: "Scorpio N" },
    { id: "thar", name: "Thar" },
    { id: "xuv300", name: "XUV300" },
    { id: "bolero_neo", name: "Bolero Neo" },
  ],
  toyota: [
    { id: "innova_crysta", name: "Innova Crysta" },
    { id: "fortuner", name: "Fortuner" },
    { id: "hyryder", name: "Hyryder" },
    { id: "glanza", name: "Glanza" },
    { id: "rumion", name: "Rumion" },
  ],
  honda: [
    { id: "city", name: "City" },
    { id: "elevate", name: "Elevate" },
    { id: "amaze", name: "Amaze" },
    { id: "jazz", name: "Jazz" },
  ],
  mg: [
    { id: "hector", name: "Hector" },
    { id: "astor", name: "Astor" },
    { id: "comet_ev", name: "Comet EV" },
    { id: "gloster", name: "Gloster" },
  ],
  volkswagen: [
    { id: "virtus", name: "Virtus" },
    { id: "taigun", name: "Taigun" },
    { id: "tiguan", name: "Tiguan" },
  ],
  skoda: [
    { id: "kushaq", name: "Kushaq" },
    { id: "slavia", name: "Slavia" },
    { id: "kodiaq", name: "Kodiaq" },
  ],
  renault: [
    { id: "kiger", name: "Kiger" },
    { id: "triber", name: "Triber" },
    { id: "kwid", name: "Kwid" },
  ],
};

export function modifySelectionCarModelScreenTitle(brandName: string): string {
  return `Which model of ${brandName}?`;
}

export function modifySelectionCarModelPath(brandId: string, modelId?: string): string {
  const base = `/kyc/modify-selection/different-car/${brandId}`;
  return modelId ? `${base}/${modelId}` : base;
}

export function getModifySelectionCarModelsForBrand(
  brandId: string,
): readonly ModifySelectionCarModelOption[] {
  const models = MODIFY_SELECTION_CAR_MODELS_BY_BRAND_ID[brandId] ?? [];
  return models.map((model) => ({
    ...model,
    thumbnailSrc: DEFAULT_THUMBNAIL,
  }));
}

export function getModifySelectionCarModelById(
  brandId: string,
  modelId: string,
): ModifySelectionCarModelOption | undefined {
  return getModifySelectionCarModelsForBrand(brandId).find((model) => model.id === modelId);
}

export function getModifySelectionCarModelStaticParams(): { brand: string; model: string }[] {
  return MODIFY_SELECTION_CAR_BRAND_OPTIONS.flatMap((brand) =>
    getModifySelectionCarModelsForBrand(brand.id).map((model) => ({
      brand: brand.id,
      model: model.id,
    })),
  );
}
