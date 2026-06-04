import {
  isModifyNoChargesFlow,
  isModifySelectionDemoFlow,
  isModifyWithChargesFlow,
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

function isModifySelectionPath(path: string): boolean {
  return (
    path === JOURNEY_PATHS.kyc.modifySelection ||
    path.startsWith(`${JOURNEY_PATHS.kyc.modifySelection}/`)
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
 * When not in a modify-selection demo flow, `/kyc/modify-selection/*` redirects to `/kyc`.
 * Modify-with-charges: only from booking accepted onward (else → booking accepted).
 * Returns `null` when no redirect is needed.
 */
export function getModifySelectionFlowRedirectTarget(
  pathname: string,
  flow?: ExperienceFlow,
): string | null {
  const path = normalizeAppPathname(pathname);
  if (!isModifySelectionPath(path)) {
    return null;
  }

  if (!isModifySelectionDemoFlow(flow)) {
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
