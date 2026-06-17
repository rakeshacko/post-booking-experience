/**
 * Canonical post-booking paths (no `basePath` prefix).
 * Use for `href`, `router.push`, and milestone rules — not for static assets.
 */
export const JOURNEY_PATHS = {
  kyc: {
    hub: "/kyc",
    upload: "/kyc/upload",
    documentsReceived: "/kyc/documents-received",
    verificationInProgress: "/kyc/verification-in-progress",
    verificationFailed: "/kyc/verification-failed",
    processing: "/kyc/processing",
    bookingConfirmed: "/kyc/booking-confirmed",
    bookingAccepted: "/kyc/booking-accepted",
    /** AckoDrive-only on-screen OTP (heads-up → enter) — replaces the dealer call. */
    otpVerify: "/kyc/otp-verify",
    modifySelection: "/kyc/modify-selection",
    cancelBooking: "/kyc/cancel-booking",
  },
  buyingGuide: {
    entry: "/kyc/buying-guide/1",
    exit: "/kyc",
  },
  carAllocation: {
    // The exact unit (engine/chassis) is now revealed on the dealer-found turn,
    // so the pending/confirmed allocation screens are gone — only the no-car
    // failure branch off the dealer search remains.
    failed: "/car-allocation/failed",
  },
  payment: {
    default: "/payment/default",
    choose: "/payment/choose",
    payDownPayment: "/payment/pay-down-payment",
  },
} as const;

export type JourneyPhase =
  | "identity_verification"
  | "kyc_documents"
  | "booking_processing"
  | "buying_guide"
  | "booking_celebration"
  | "booking_accepted"
  | "car_allocation"
  | "payment"
  | "delivery"
  | "unknown";

const IDENTITY_VERIFICATION_PATHS = new Set<string>([JOURNEY_PATHS.kyc.hub]);

const KYC_DOCUMENT_PATHS = new Set<string>([
  JOURNEY_PATHS.kyc.upload,
  JOURNEY_PATHS.kyc.documentsReceived,
  JOURNEY_PATHS.kyc.verificationInProgress,
  JOURNEY_PATHS.kyc.verificationFailed,
]);

const BUYING_GUIDE_STEP_PATH = /^\/kyc\/buying-guide\/[1-4]$/;
const CAR_ALLOCATION_PATH = /^\/car-allocation\//;
const KYC_CAR_ALLOCATION_LEGACY = /^\/kyc\/car-allocation-/;
const DELIVERY_PATH = /^\/kyc\/car-delivery-/;
const PAYMENT_PATH = /^\/payment\//;

/**
 * Strip trailing slashes so route rules match `trailingSlash: true` URLs
 * (e.g. `/kyc/` → `/kyc`).
 */
export function normalizeAppPathname(pathname: string): string {
  let path = pathname || "/";

  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
  }

  return path || "/";
}

export function buyingGuideStepPath(step: number): string {
  return `/kyc/buying-guide/${step}`;
}

/**
 * Maps the current URL to a journey phase for copy, fees, and flow branching.
 * Phases are coarse — use URL parsers elsewhere for payment instalment state.
 */
export function resolveJourneyPhase(pathname: string): JourneyPhase {
  const path = normalizeAppPathname(pathname);

  if (IDENTITY_VERIFICATION_PATHS.has(path)) {
    return "identity_verification";
  }
  if (KYC_DOCUMENT_PATHS.has(path)) {
    return "kyc_documents";
  }
  if (path === JOURNEY_PATHS.kyc.processing) {
    return "booking_processing";
  }
  if (BUYING_GUIDE_STEP_PATH.test(path)) {
    return "buying_guide";
  }
  if (path === JOURNEY_PATHS.kyc.bookingConfirmed) {
    return "booking_celebration";
  }
  if (path === JOURNEY_PATHS.kyc.bookingAccepted) {
    return "booking_accepted";
  }
  if (CAR_ALLOCATION_PATH.test(path) || KYC_CAR_ALLOCATION_LEGACY.test(path)) {
    return "car_allocation";
  }
  if (DELIVERY_PATH.test(path)) {
    return "delivery";
  }
  if (PAYMENT_PATH.test(path)) {
    return "payment";
  }

  return "unknown";
}

/** Verify identity → KYC docs → processing booking (inclusive). */
export function isIdentityFunnelPhase(phase: JourneyPhase): boolean {
  return (
    phase === "identity_verification" ||
    phase === "kyc_documents" ||
    phase === "booking_processing"
  );
}

/** From booking accepted through payment — change selection with fees is available. */
export function isChangeSelectionAvailablePhase(phase: JourneyPhase): boolean {
  return (
    phase === "booking_accepted" ||
    phase === "booking_celebration" ||
    phase === "buying_guide" ||
    phase === "car_allocation" ||
    phase === "payment" ||
    phase === "delivery"
  );
}
