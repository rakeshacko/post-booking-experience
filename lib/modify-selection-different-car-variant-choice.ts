const STORAGE_KEY = "pbe_modify_selection_different_car_variant_choice_v1";

/** Selected variant before the colour step in the different-car flow. */
export function readModifySelectionDifferentCarVariantChoice(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return typeof raw === "string" && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

export function writeModifySelectionDifferentCarVariantChoice(variantId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, variantId);
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearModifySelectionDifferentCarVariantChoice(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
