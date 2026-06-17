/**
 * Dealer visibility — an experience variant orthogonal to the delivery flow
 * (express/standard). It controls who the customer appears to deal with:
 *
 * - `revealed`   — the sourcing dealer is named (Advaith Hyundai) and the car
 *   is locked via the dealer's phone call + OTP read-back.
 * - `acko_only`  — the dealer is never named; the customer only ever deals with
 *   AckoDrive. The OTP still happens, but on-screen (heads-up → enter), and
 *   AckoDrive relays it to the dealer in the background — no call.
 */
export type DealerVisibility = "revealed" | "acko_only";

export const DEALER_VISIBILITY_STORAGE_KEY = "post-booking-dealer-visibility";

export const DEFAULT_DEALER_VISIBILITY: DealerVisibility = "revealed";

/** The real sourcing dealer — shown only in `revealed`. */
export const DEALER_NAME = "Advaith Hyundai";
export const DEALER_DETAIL = "Whitefield · Bengaluru";

/** The party the customer always deals with — the only name shown in `acko_only`. */
export const ACKO_PARTNER_NAME = "AckoDrive";
export const ACKO_PARTNER_DETAIL = "Sourced & reserved for you";

export type DealerVisibilityDefinition = {
  id: DealerVisibility;
  label: string;
  description: string;
};

export const DEALER_VISIBILITIES: readonly DealerVisibilityDefinition[] = [
  {
    id: "revealed",
    label: "Show the dealer",
    description: "Name the sourcing dealer; the dealer calls to confirm the OTP",
  },
  {
    id: "acko_only",
    label: "AckoDrive only",
    description: "Hide the dealer entirely; OTP happens on-screen, no dealer call",
  },
] as const;

export function isDealerVisibility(
  value: string | null | undefined,
): value is DealerVisibility {
  return value === "revealed" || value === "acko_only";
}

export function readDealerVisibility(): DealerVisibility {
  if (typeof window === "undefined") return DEFAULT_DEALER_VISIBILITY;
  try {
    const stored = sessionStorage.getItem(DEALER_VISIBILITY_STORAGE_KEY);
    return isDealerVisibility(stored) ? stored : DEFAULT_DEALER_VISIBILITY;
  } catch {
    return DEFAULT_DEALER_VISIBILITY;
  }
}

export function writeDealerVisibility(visibility: DealerVisibility): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(DEALER_VISIBILITY_STORAGE_KEY, visibility);
  } catch {
    /* ignore quota / private mode */
  }
}

export function isAckoOnly(visibility?: DealerVisibility): boolean {
  const active = visibility ?? readDealerVisibility();
  return active === "acko_only";
}

/** Who the car is attributed to on cards/receipts, by visibility. */
export function resolveDealerAttribution(visibility: DealerVisibility): {
  name: string;
  detail: string;
} {
  return isAckoOnly(visibility)
    ? { name: ACKO_PARTNER_NAME, detail: ACKO_PARTNER_DETAIL }
    : { name: DEALER_NAME, detail: DEALER_DETAIL };
}
