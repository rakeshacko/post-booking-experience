import type { BookingCarCardDetailsProps } from "@/components/kyc/BookingCarCardDetails";
import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";
import {
  BOOKING_EXPRESS_DELIVERY_TEXT_CLASS,
  BOOKING_STANDARD_DELIVERY_TEXT_CLASS,
  getBookingDeliveryIconSrc,
} from "@/lib/experience-flow-content";
import { getModifySelectionCarCutoutForColour } from "@/lib/modify-selection-car-cutouts";
import type { ModifySelectionColourOption } from "@/lib/modify-selection-colours-content";
import type { ModifySelectionDeliveryChoice } from "@/lib/modify-selection-colours-content";
import { MODIFY_SELECTION_NEW_BOOKING_AMOUNT_INR } from "@/lib/modify-selection-review-pay-content";
import type { ModifySelectionReviewPaySummary } from "@/lib/modify-selection-review-pay-content";
import type { ModifySelectionColourPending } from "@/lib/modify-selection-colour-pending";

const STORAGE_KEY = "pbe_active_booking_snapshot_v1";
const PENDING_PAYMENT_STORAGE_KEY = "pbe_modify_selection_pending_payment_v1";

/** Selection committed at Pay — promoted to active booking only after checkout succeeds. */
export type ModifySelectionPendingPayment = Omit<
  ActiveBookingSnapshot,
  "lastBookingAmountPaidInr" | "selectionChangeCompleted"
>;

export type ActiveBookingSnapshot = {
  colourId: string;
  colourName: string;
  deliveryChoice: ModifySelectionDeliveryChoice;
  deliveryLine: string;
  isExpressDelivery: boolean;
  /** Total booking amount for the updated selection (demo). */
  newBookingAmountInr: number;
  /** Overrides for manage-booking / booking-received cards. */
  carTitle?: string;
  carVariant?: string;
  /** Instalment paid at mock checkout for this change (demo). */
  lastBookingAmountPaidInr?: number;
  /** Set after modify-selection booking-lock payment succeeds. */
  selectionChangeCompleted?: boolean;
};

function parseActiveBookingSnapshot(raw: string): ActiveBookingSnapshot | null {
  try {
    const parsed = JSON.parse(raw) as ActiveBookingSnapshot;
    if (typeof parsed.colourId !== "string" || typeof parsed.colourName !== "string") {
      return null;
    }
    if (parsed.deliveryChoice !== "express" && parsed.deliveryChoice !== "standard") {
      return null;
    }
    if (typeof parsed.deliveryLine !== "string" || typeof parsed.isExpressDelivery !== "boolean") {
      return null;
    }
    const newBookingAmountInr = Number(parsed.newBookingAmountInr);
    if (!Number.isFinite(newBookingAmountInr) || newBookingAmountInr <= 0) {
      return null;
    }
    return { ...parsed, newBookingAmountInr: Math.round(newBookingAmountInr) };
  } catch {
    return null;
  }
}

/** Completed selection only — used on /kyc manage booking after booking-received. */
export function readActiveBookingSnapshot(): ActiveBookingSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw == null) return null;
    const parsed = parseActiveBookingSnapshot(raw);
    if (parsed == null) return null;
    if (parsed.selectionChangeCompleted !== true) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function readModifySelectionPendingPayment(): ModifySelectionPendingPayment | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(PENDING_PAYMENT_STORAGE_KEY);
    if (raw == null) return null;
    return parseActiveBookingSnapshot(raw) as ModifySelectionPendingPayment | null;
  } catch {
    return null;
  }
}

export function writeModifySelectionPendingPayment(
  pending: ModifySelectionPendingPayment,
): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(PENDING_PAYMENT_STORAGE_KEY, JSON.stringify(pending));
  } catch {
    /* ignore */
  }
}

export function clearModifySelectionPendingPayment(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(PENDING_PAYMENT_STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Booking received — pending checkout selection or already completed. */
export function readBookingSnapshotForCelebration(): ActiveBookingSnapshot | null {
  const completed = readActiveBookingSnapshot();
  if (completed != null) return completed;
  return readModifySelectionPendingPayment();
}

/**
 * Hydrates booking-received UI from session storage.
 * On payment success, always commits fresh pending checkout before reading completed —
 * otherwise a prior `selectionChangeCompleted` snapshot wins over a new selection.
 */
export function syncModifySelectionBookingSnapshot(
  variant: "default" | "payment",
  paidBookingAmountInr: number,
): ActiveBookingSnapshot | null {
  if (variant === "payment") {
    const pending = readModifySelectionPendingPayment();
    if (pending != null) {
      return commitActiveBookingAfterModifyPayment(pending, paidBookingAmountInr);
    }
  }

  const completed = readActiveBookingSnapshot();
  if (completed != null) return completed;

  return readModifySelectionPendingPayment();
}

export function commitActiveBookingAfterModifyPayment(
  pending: ModifySelectionPendingPayment,
  paidBookingAmountInr: number,
): ActiveBookingSnapshot {
  const next: ActiveBookingSnapshot = {
    ...pending,
    lastBookingAmountPaidInr: Math.round(paidBookingAmountInr),
    selectionChangeCompleted: true,
  };
  writeActiveBookingSnapshot(next);
  clearModifySelectionPendingPayment();
  return next;
}

export function writeActiveBookingSnapshot(snapshot: ActiveBookingSnapshot): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    /* ignore quota / private mode */
  }
}

export function writeModifySelectionPendingFromSummary(
  summary: ModifySelectionReviewPaySummary,
  selection: {
    colourId: string;
    colourName: string;
    deliveryChoice: ModifySelectionDeliveryChoice;
    carTitle?: string;
    carVariant?: string;
  },
): void {
  writeModifySelectionPendingPayment({
    colourId: selection.colourId,
    colourName: selection.colourName,
    deliveryChoice: selection.deliveryChoice,
    deliveryLine: summary.deliveryLine,
    isExpressDelivery: summary.isExpressDelivery,
    newBookingAmountInr: summary.newBookingAmountInr,
    carTitle: selection.carTitle,
    carVariant: selection.carVariant,
  });
}

/** @deprecated Use {@link writeModifySelectionPendingFromSummary} on Pay; commit after checkout. */
export function commitActiveBookingSnapshotFromSummary(
  summary: ModifySelectionReviewPaySummary,
  selection: {
    colourId: string;
    colourName: string;
    deliveryChoice: ModifySelectionDeliveryChoice;
    carTitle?: string;
    carVariant?: string;
  },
  paidBookingAmountInr?: number,
): void {
  writeModifySelectionPendingFromSummary(summary, selection);
  if (paidBookingAmountInr != null) {
    const pending = readModifySelectionPendingPayment();
    if (pending != null) {
      commitActiveBookingAfterModifyPayment(pending, paidBookingAmountInr);
    }
  }
}

export function commitActiveBookingFromColourChange(
  pending: ModifySelectionColourPending,
  option: ModifySelectionColourOption,
  summary: ModifySelectionReviewPaySummary,
  paidBookingAmountInr?: number,
): void {
  writeModifySelectionPendingFromSummary(summary, {
    colourId: pending.colourId,
    colourName: option.name,
    deliveryChoice: pending.deliveryChoice,
  });
  if (paidBookingAmountInr != null) {
    const stored = readModifySelectionPendingPayment();
    if (stored != null) {
      commitActiveBookingAfterModifyPayment(stored, paidBookingAmountInr);
    }
  }
}

export function activeBookingCardDetails(
  snapshot: ActiveBookingSnapshot,
): Pick<
  BookingCarCardDetailsProps,
  "carColor" | "carTitle" | "carVariant" | "deliveryLine" | "deliveryTextClass" | "deliveryIconSrc"
> {
  return {
    carColor: snapshot.colourName,
    carTitle: snapshot.carTitle,
    carVariant: snapshot.carVariant,
    deliveryLine: snapshot.deliveryLine,
    deliveryTextClass: snapshot.isExpressDelivery
      ? BOOKING_EXPRESS_DELIVERY_TEXT_CLASS
      : BOOKING_STANDARD_DELIVERY_TEXT_CLASS,
    deliveryIconSrc: snapshot.isExpressDelivery
      ? BOOKING_CONFIRMED_ASSETS.expressDelivery
      : getBookingDeliveryIconSrc("standard"),
  };
}

export function activeBookingCarCutoutSrc(snapshot: ActiveBookingSnapshot) {
  return getModifySelectionCarCutoutForColour(snapshot.colourId);
}
