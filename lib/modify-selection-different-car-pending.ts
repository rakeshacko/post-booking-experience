import type { ModifySelectionDeliveryChoice } from "@/lib/modify-selection-colours-content";

const STORAGE_KEY = "pbe_modify_selection_different_car_pending_v1";

export type ModifySelectionDifferentCarPending = {
  brandId: string;
  modelId: string;
  variantId: string;
  colourId: string;
  deliveryChoice: ModifySelectionDeliveryChoice;
};

export function readModifySelectionDifferentCarPending(): ModifySelectionDifferentCarPending | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    const parsed = JSON.parse(raw) as ModifySelectionDifferentCarPending;
    if (
      typeof parsed.brandId !== "string" ||
      typeof parsed.modelId !== "string" ||
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

export function writeModifySelectionDifferentCarPending(
  pending: ModifySelectionDifferentCarPending,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
  } catch {
    /* ignore quota / private mode */
  }
}

export function clearModifySelectionDifferentCarPending(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
