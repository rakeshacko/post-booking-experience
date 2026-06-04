const STORAGE_KEY = "pbe_modify_selection_variant_choice_v1";

/** Selected variant before the colour step in the change-variant flow. */
export function readModifySelectionVariantChoice(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return typeof raw === "string" && raw.length > 0 ? raw : null;
  } catch {
    return null;
  }
}

export function writeModifySelectionVariantChoice(variantId: string): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, variantId);
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearModifySelectionVariantChoice(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
