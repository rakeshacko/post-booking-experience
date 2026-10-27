import { useSyncExternalStore } from "react";

/**
 * Live mode — the journey follows a real booking in the demo OMS instead of
 * the scripted time-skips. Open any page with `?live=AD-4821` to start
 * (`?live=off` stops). The OMS stage decides the screen; the orchestrator moves
 * the stage as dealers reply on WhatsApp.
 */
export type LiveBooking = {
  bookingId: string;
  stage: string;
  stageLabel: string;
  stageSince: string;
  firstName: string;
  car: { make: string; model: string; variant: string; fuel: string; colour: string };
  dealer: string;
  loan: { bank: string; amount: string; rate: string; emi: string; tenureMonths: string };
  allocation?: { vin: string; engine: string; chassis: string };
  version: number;
};

export const LIVE_OMS_URL = process.env.NEXT_PUBLIC_LIVE_OMS_URL ?? "http://127.0.0.1:8092";

const STORAGE_KEY = "post-booking-live-booking";

export function readLiveBookingId(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeLiveBookingId(id: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (id) sessionStorage.setItem(STORAGE_KEY, id);
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore quota / private mode */
  }
}

/** OMS stages in order — the journey only ever moves forward through these. */
const STAGE_ORDER = [
  "BOOKING_DONE",
  "KYC_APPROVED",
  "DEALER_ALLOCATED",
  "BOOKING_CONFIRMED_ON_OEM",
  "CAR_ALLOCATED",
  "LOAN_APPROVED",
  "DOWN_PAYMENT_DONE",
  "CAR_INVOICED",
  "POLICY_ISSUED",
  "RTO_DONE",
  "CAR_DELIVERED",
] as const;

export function stageIndex(stage: string | undefined): number {
  return stage ? STAGE_ORDER.indexOf(stage as (typeof STAGE_ORDER)[number]) : -1;
}

/** The screen that tells the customer where this stage stands; null keeps the current one. */
export function routeForStage(stage: string, bankId?: string): string | null {
  const i = stageIndex(stage);
  if (i < 0) return null;
  if (i <= stageIndex("BOOKING_CONFIRMED_ON_OEM")) return "/kyc/processing";
  if (stage === "CAR_ALLOCATED") return "/kyc/booking-accepted";
  if (stage === "LOAN_APPROVED") {
    return bankId ? `/payment/loan-sanctioned?bank=${encodeURIComponent(bankId)}` : "/payment/loan-sanctioned";
  }
  return null;
}

/** "HDFC Bank" → "hdfc", matched against the bank sheet ids. */
export function bankIdFor(bankName: string, ids: readonly string[]): string | undefined {
  const name = bankName.toLowerCase();
  return ids.find((id) => name.includes(id));
}

/** "₹10,76,780" → 1076780; 0 when absent. */
export function rupeesToNumber(value: string | undefined): number {
  const digits = (value ?? "").replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

let current: LiveBooking | null = null;
let currentJson = "null";
const listeners = new Set<() => void>();

/** Publishes only real changes, so a poll that finds nothing new doesn't re-render the turn. */
export function setLiveBooking(next: LiveBooking | null): void {
  const json = JSON.stringify(next);
  if (json === currentJson) return;
  current = next;
  currentJson = json;
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** The followed booking's latest OMS view, or null outside live mode. */
export function useLiveBooking(): LiveBooking | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
