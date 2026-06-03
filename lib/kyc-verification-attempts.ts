const STORAGE_KEY = "pbe_kyc_verification_failure_count_v1";

/** Times the user has reached verification-failed from in-progress (demo; replace with API). */
export function readKycVerificationFailureCount(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const n = raw != null ? Number.parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

export function writeKycVerificationFailureCount(count: number): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, String(Math.max(0, Math.floor(count))));
  } catch {
    /* ignore */
  }
}

/** Call when routing from verification-in-progress to verification-failed. Returns new count. */
export function recordKycVerificationFailure(): number {
  const next = readKycVerificationFailureCount() + 1;
  writeKycVerificationFailureCount(next);
  return next;
}

export function resetKycVerificationFailureCount(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/** Second failure — booking cancelled, refund initiated (demo threshold). */
export function hasExhaustedKycVerificationRetries(): boolean {
  return readKycVerificationFailureCount() >= 2;
}
