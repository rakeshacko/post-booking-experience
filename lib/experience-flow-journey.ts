import {
  isCancelNoChargesFlow,
  isModifyNoChargesFlow,
  isModifySelectionDemoFlow,
  isModifyWithChargesFlow,
  readExperienceFlow,
  type ExperienceFlow,
} from "@/lib/experience-flow";
import {
  isChangeSelectionAvailablePhase,
  JOURNEY_PATHS,
  normalizeAppPathname,
  resolveJourneyPhase,
} from "@/lib/journey-routes";
import { MODIFY_SELECTION_RETURN_SOURCE } from "@/lib/paymentUrls";

/** Optional query context for modify-no-charges journey guards. */
export type ModifyNoChargesJourneyContext = {
  returnSource?: string | null;
  /** `payment` — booking-lock success after mock checkout. */
  bookingConfirmedSource?: string | null;
};

function isModifySelectionBookingReceivedPath(
  path: string,
  context?: ModifyNoChargesJourneyContext,
): boolean {
  if (path !== JOURNEY_PATHS.kyc.bookingConfirmed) return false;
  return (
    context?.returnSource === MODIFY_SELECTION_RETURN_SOURCE &&
    context?.bookingConfirmedSource === "payment"
  );
}

/** Paths beyond KYC pending that redirect to `/kyc` in the modify-no-charges demo flow. */
const MODIFY_NO_CHARGES_BLOCKED_PATHS = new Set<string>([
  JOURNEY_PATHS.kyc.upload,
  JOURNEY_PATHS.kyc.documentsReceived,
  JOURNEY_PATHS.kyc.verificationInProgress,
  JOURNEY_PATHS.kyc.verificationFailed,
  JOURNEY_PATHS.kyc.processing,
  JOURNEY_PATHS.kyc.bookingAccepted,
  JOURNEY_PATHS.kyc.bookingConfirmed,
  JOURNEY_PATHS.carAllocation.pending,
  JOURNEY_PATHS.carAllocation.confirmed,
]);

/** Paths beyond verification in progress that redirect in the cancel-no-charges demo flow. */
const CANCEL_NO_CHARGES_BLOCKED_PATHS = new Set<string>([
  JOURNEY_PATHS.kyc.verificationFailed,
  JOURNEY_PATHS.kyc.processing,
  JOURNEY_PATHS.kyc.bookingAccepted,
  JOURNEY_PATHS.kyc.bookingConfirmed,
  JOURNEY_PATHS.carAllocation.pending,
  JOURNEY_PATHS.carAllocation.confirmed,
]);

const CANCEL_NO_CHARGES_ALLOWED_KYC_PATHS = new Set<string>([
  JOURNEY_PATHS.kyc.hub,
  JOURNEY_PATHS.kyc.upload,
  JOURNEY_PATHS.kyc.documentsReceived,
  JOURNEY_PATHS.kyc.verificationInProgress,
]);

function isModifySelectionPath(path: string): boolean {
  return (
    path === JOURNEY_PATHS.kyc.modifySelection ||
    path.startsWith(`${JOURNEY_PATHS.kyc.modifySelection}/`)
  );
}

function isCancelBookingPath(path: string): boolean {
  return (
    path === JOURNEY_PATHS.kyc.cancelBooking ||
    path.startsWith(`${JOURNEY_PATHS.kyc.cancelBooking}/`)
  );
}

/** Whether the path is reachable in the modify-no-charges demo (quote → KYC pending + modify routes). */
export function isModifyNoChargesFlowPathAllowed(
  pathname: string,
  context?: ModifyNoChargesJourneyContext,
): boolean {
  const path = normalizeAppPathname(pathname);

  if (path === JOURNEY_PATHS.kyc.hub || isModifySelectionPath(path)) {
    return true;
  }

  if (isModifySelectionBookingReceivedPath(path, context)) {
    return true;
  }

  if (MODIFY_NO_CHARGES_BLOCKED_PATHS.has(path)) {
    return false;
  }

  if (path.startsWith("/car-allocation/") || /^\/kyc\/car-allocation-/.test(path)) {
    return false;
  }

  return true;
}

/** Whether the path is reachable in the cancel-no-charges demo (quote → verification in progress + cancel routes). */
export function isCancelNoChargesFlowPathAllowed(pathname: string): boolean {
  const path = normalizeAppPathname(pathname);

  if (CANCEL_NO_CHARGES_ALLOWED_KYC_PATHS.has(path) || isCancelBookingPath(path)) {
    return true;
  }

  if (isModifySelectionPath(path)) {
    return false;
  }

  if (CANCEL_NO_CHARGES_BLOCKED_PATHS.has(path)) {
    return false;
  }

  if (path.startsWith("/car-allocation/") || /^\/kyc\/car-allocation-/.test(path)) {
    return false;
  }

  return true;
}

/**
 * When the modify-no-charges flow is active, post–KYC-pending URLs redirect to `/kyc`.
 * Returns `null` when no redirect is needed.
 */
export function getModifyNoChargesRedirectTarget(
  pathname: string,
  flow?: ExperienceFlow,
  context?: ModifyNoChargesJourneyContext,
): string | null {
  if (!isModifyNoChargesFlow(flow)) {
    return null;
  }

  if (isModifyNoChargesFlowPathAllowed(pathname, context)) {
    return null;
  }

  const path = normalizeAppPathname(pathname);

  if (
    path.startsWith("/kyc/") ||
    path.startsWith("/car-allocation/") ||
    /^\/kyc\/car-allocation-/.test(path)
  ) {
    return JOURNEY_PATHS.kyc.hub;
  }

  return null;
}

/**
 * When the cancel-no-charges flow is active, post–verification-in-progress URLs redirect
 * to `/kyc/verification-in-progress`. Returns `null` when no redirect is needed.
 */
export function getCancelNoChargesRedirectTarget(
  pathname: string,
  flow?: ExperienceFlow,
): string | null {
  if (!isCancelNoChargesFlow(flow)) {
    return null;
  }

  if (isCancelNoChargesFlowPathAllowed(pathname)) {
    return null;
  }

  const path = normalizeAppPathname(pathname);

  if (isModifySelectionPath(path)) {
    return JOURNEY_PATHS.kyc.verificationInProgress;
  }

  if (
    path.startsWith("/kyc/") ||
    path.startsWith("/car-allocation/") ||
    /^\/kyc\/car-allocation-/.test(path)
  ) {
    return JOURNEY_PATHS.kyc.verificationInProgress;
  }

  return null;
}

/**
 * Unified journey guard for modify-no-charges and cancel-no-charges demo flows.
 * Returns `null` when no redirect is needed.
 */
export function getExperienceFlowJourneyRedirectTarget(
  pathname: string,
  flow?: ExperienceFlow,
  context?: ModifyNoChargesJourneyContext,
): string | null {
  const active = flow ?? readExperienceFlow();

  const modifyTarget = getModifyNoChargesRedirectTarget(pathname, active, context);
  if (modifyTarget) return modifyTarget;

  const cancelTarget = getCancelNoChargesRedirectTarget(pathname, active);
  if (cancelTarget) return cancelTarget;

  return null;
}

/**
 * Modify-selection routes are open to express/standard (policy §2.3 — one change
 * post-confirmation belongs to every booking) and the modify demo flows; other
 * flows redirect to `/kyc`. Modify-with-charges: only from booking accepted
 * onward (else → booking accepted). Returns `null` when no redirect is needed.
 */
export function getModifySelectionFlowRedirectTarget(
  pathname: string,
  flow?: ExperienceFlow,
): string | null {
  const path = normalizeAppPathname(pathname);
  if (!isModifySelectionPath(path)) {
    return null;
  }

  const active = flow ?? readExperienceFlow();
  const allowed =
    isModifySelectionDemoFlow(active) || active === "express" || active === "standard";
  if (!allowed) {
    return JOURNEY_PATHS.kyc.hub;
  }

  if (isModifyWithChargesFlow(flow) && !isModifySelectionPath(path)) {
    const phase = resolveJourneyPhase(pathname);
    if (!isChangeSelectionAvailablePhase(phase)) {
      return JOURNEY_PATHS.kyc.bookingAccepted;
    }
  }

  return null;
}

/**
 * Cancel-booking routes are only reachable in the cancel-no-charges demo flow.
 * Returns `null` when no redirect is needed.
 */
export function getCancelBookingFlowRedirectTarget(
  pathname: string,
  flow?: ExperienceFlow,
): string | null {
  const path = normalizeAppPathname(pathname);
  if (!isCancelBookingPath(path)) {
    return null;
  }

  if (!isCancelNoChargesFlow(flow)) {
    return JOURNEY_PATHS.kyc.hub;
  }

  return null;
}
