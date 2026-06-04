import type { ModifySelectionDeliveryChoice } from "@/lib/modify-selection-colours-content";

const STORAGE_KEY = "pbe_modify_selection_variant_pending_v1";

export type ModifySelectionVariantPending = {
  variantId: string;
  colourId: string;
  deliveryChoice: ModifySelectionDeliveryChoice;
};

export function readModifySelectionVariantPending(): ModifySelectionVariantPending | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    const parsed = JSON.parse(raw) as ModifySelectionVariantPending;
    if (
      typeof parsed.variantId !== "string" ||
      typeof parsed.colourId !== "string" ||
      (parsed.deliveryChoice !== "express" && parsed.deliveryChoice !== "standard")
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function writeModifySelectionVariantPending(pending: ModifySelectionVariantPending): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearModifySelectionVariantPending(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
