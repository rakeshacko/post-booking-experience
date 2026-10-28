import { useSyncExternalStore } from "react";

import { INSTANT_REVEAL_KEY } from "@/lib/concierge/instant";

/**
 * Live mode — the journey follows a real booking in the demo OMS instead of
 * the scripted time-skips. Open any page with `?live=AD-4821` to start
 * (`?live=off` stops), or set `NEXT_PUBLIC_LIVE_BOOKING_ID` so a clean URL
 * starts it. The OMS stage decides the screen; the orchestrator moves the stage
 * as dealers reply on WhatsApp.
 *
 * In live mode the app is the customer's real phone: no presenter chrome
 * (time-skips, variant switches) and the dealer is never named — the customer
 * only ever deals with AckoDrive (`acko_only` dealer visibility is forced).
 */
export type LiveBooking = {
  bookingId: string;
  stage: string;
  stageLabel: string;
  stageSince: string;
  firstName: string;
  car: { make: string; model: string; variant: string; fuel: string; colour: string };
  // The OMS also sends `dealer`; it is dropped on arrival so no screen can show it.
  loan: { bank: string; amount: string; rate: string; emi: string; tenureMonths: string };
  /** The booked price, shaped like `loan` ("₹13,63,780"; "" when OMS has none). */
  price?: { onRoad: string; exShowroom: string };
  /** The booking amount paid in the app ("₹10,000"); "" while the booking is still a quote. */
  bookingAmountPaid?: string;
  allocation?: { vin: string; engine: string; chassis: string };
  /** The OEM OTP call that locks the car to the customer (see `LiveOtp`). */
  otp?: LiveOtp;
  version: number;
};

/**
 * The OEM OTP call. The orchestrator offers times inside the dealer's OTP hours;
 * the customer picks one; when it opens they say "I'm here" and only then does
 * the dealer send the code, read out on a call through ACKO Drive's line.
 */
export type LiveOtp = {
  /** "" until times are offered · offered → booked → checking ("Are you free?") → ready → verified; missed → offered again. */
  state: "" | "offered" | "booked" | "checking" | "ready" | "verified" | "missed";
  slots: { start: string; day: string; time: string }[];
  /** Offered again after a missed call. */
  again: boolean;
  /** "asked": none of the times worked and the dealer was asked for one · a time: the extra one · "sfm": a person will call. */
  extra: string;
  slot?: { start: string; end: string; label: string };
  /** ACKO Drive's line, which calls the customer. */
  line: string;
  verifiedAt?: string;
};

export type LiveOtpAction = "pick" | "here" | "not_now" | "none";

export const LIVE_OMS_URL = process.env.NEXT_PUBLIC_LIVE_OMS_URL ?? "http://127.0.0.1:8092";

const STORAGE_KEY = "post-booking-live-booking";
/** Remembered for the tab when `?live=off` stops live mode, so the default id can't restart it. */
const LIVE_OFF = "off";

function normalizeBookingId(value: string | null | undefined): string | null {
  const id = value?.trim();
  return id ? id.toUpperCase() : null;
}

/** Build-time default booking, used when the URL and the tab name none. */
const DEFAULT_LIVE_BOOKING_ID = normalizeBookingId(process.env.NEXT_PUBLIC_LIVE_BOOKING_ID);

let resolvedBookingId: { id: string | null } | null = null;

/**
 * The booking this tab follows, or null outside live mode. In order:
 * `?live=<id>` (remembered for the tab) · `?live=off` (stops it for the tab) ·
 * what the tab remembered · `NEXT_PUBLIC_LIVE_BOOKING_ID`. Resolved once per
 * page load, so it is already right during the first render.
 */
export function readLiveBookingId(): string | null {
  if (typeof window === "undefined") return DEFAULT_LIVE_BOOKING_ID;
  if (resolvedBookingId) return resolvedBookingId.id;

  const param = new URLSearchParams(window.location.search).get("live")?.trim();
  const fromParam = param
    ? param.toLowerCase() === LIVE_OFF
      ? LIVE_OFF
      : normalizeBookingId(param)
    : null;
  let remembered: string | null = fromParam;
  try {
    if (fromParam) sessionStorage.setItem(STORAGE_KEY, fromParam);
    remembered = sessionStorage.getItem(STORAGE_KEY);
  } catch {
    /* private mode — the URL alone decides */
  }

  const id = remembered === LIVE_OFF ? null : (remembered ?? DEFAULT_LIVE_BOOKING_ID);
  resolvedBookingId = { id };
  return id;
}

/** True while this tab follows a live booking. */
export function isLiveMode(): boolean {
  return readLiveBookingId() !== null;
}

const subscribeNever = () => () => {};

/**
 * The followed booking id for rendering — right on the first client render
 * after a navigation; on a full page load it hydrates as the build-time
 * default, then settles to the tab's choice.
 */
export function useLiveBookingId(): string | null {
  return useSyncExternalStore(subscribeNever, readLiveBookingId, () => DEFAULT_LIVE_BOOKING_ID);
}

/** True while this tab follows a live booking (see `useLiveBookingId`). */
export function useLiveMode(): boolean {
  return useLiveBookingId() !== null;
}

/**
 * OMS stages in order — the journey only ever moves forward through these.
 * `QUOTE` is the booking before the customer pays; paying in the app makes it
 * `BOOKING_DONE`, and staff approving the KYC documents makes it `KYC_APPROVED`.
 */
const STAGE_ORDER = [
  "QUOTE",
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

/**
 * The screen that tells the customer where this stage stands; null keeps the
 * current one. Before KYC is approved the customer drives (quote → pay → add
 * documents), so nothing pulls them anywhere until staff approve.
 */
export function routeForStage(stage: string, bankId?: string): string | null {
  const i = stageIndex(stage);
  if (i < stageIndex("KYC_APPROVED")) return null;
  // Finding the dealer, the OEM OTP call and the OEM booking all play out on one screen.
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

/** The OMS customer status as the app keeps it: the dealer field goes no further. */
export function toLiveBooking(json: unknown): LiveBooking {
  const next = json as LiveBooking & { dealer?: unknown };
  delete next.dealer;
  return next;
}

/** A body the OMS can't parse into a status still says why, e.g. `{"error":"no quote"}`. */
async function omsError(res: Response): Promise<Error> {
  let detail = "";
  try {
    detail = ((await res.json()) as { error?: string }).error ?? "";
  } catch {
    /* not JSON */
  }
  return new Error(`OMS ${res.status}${detail ? `: ${detail}` : ""}`);
}

/**
 * What the customer does before staff take over, sent to the followed booking:
 * `book` pays the booking amount (QUOTE → BOOKING_DONE), `kyc` files the PAN
 * and Aadhaar. Both are safe to repeat. Publishes the OMS's answer and returns
 * it; throws when the OMS can't be reached or refuses.
 */
export async function postLiveBooking(
  action: "book" | "kyc",
  body: LiveBookBody | LiveKycBody,
): Promise<LiveBooking> {
  const bookingId = readLiveBookingId();
  if (!bookingId) throw new Error("No live booking");
  const res = await fetch(
    `${LIVE_OMS_URL}/oms/v1/customer/bookings/${encodeURIComponent(bookingId)}/${action}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    },
  );
  if (!res.ok) throw await omsError(res);
  const next = toLiveBooking(await res.json());
  setLiveBooking(next);
  return next;
}

/** A tap on the OEM OTP call: a time, I'm here, Not now, none of these work. */
export async function postLiveOtp(action: LiveOtpAction, slot = ""): Promise<LiveBooking> {
  const bookingId = readLiveBookingId();
  if (!bookingId) throw new Error("No live booking");
  const res = await fetch(`${LIVE_OMS_URL}/oms/v1/customer/bookings/${encodeURIComponent(bookingId)}/otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, slot }),
    cache: "no-store",
  });
  if (!res.ok) throw await omsError(res);
  const next = toLiveBooking(await res.json());
  setLiveBooking(next);
  return next;
}

export type LivePaymentMethod = "upi" | "card" | "netbanking";
export type LiveBookBody = { method: LivePaymentMethod; amount: number };
export type LiveKycBody = {
  source: "digilocker" | "upload";
  documents: { type: "aadhaar" | "pan"; name: string }[];
};

/** Tab storage that survives a fresh run: which booking the tab follows, and the instant-reveal switch. */
const KEPT_ON_RESET = new Set([STORAGE_KEY, INSTANT_REVEAL_KEY]);

/**
 * Forgets the journey this tab walked (paid, documents added, scenario, KYC
 * failures, echoes…), for when the OMS says the booking is back at QUOTE: a
 * fresh run must not inherit the last one. Journey keys all start `pbe` or
 * `post-booking-`.
 */
export function clearJourneyState(): void {
  if (typeof window === "undefined") return;
  try {
    const keys: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && (key.startsWith("pbe") || key.startsWith("post-booking-")) && !KEPT_ON_RESET.has(key)) {
        keys.push(key);
      }
    }
    keys.forEach((key) => sessionStorage.removeItem(key));
  } catch {
    /* private mode — nothing was kept */
  }
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

/**
 * The customer's first name: the live booking's, else the scripted Sharath. The
 * script is written for Sharath, so `withCustomerName` swaps his name in its lines.
 */
export function useCustomerFirstName(): string {
  return useLiveBooking()?.firstName || "Sharath";
}

export function withCustomerName(text: string, firstName: string): string {
  return firstName === "Sharath" ? text : text.replace(/\bSharath\b/g, firstName);
}

/** The followed booking's latest OMS view, or null outside live mode. */
export function useLiveBooking(): LiveBooking | null {
  return useSyncExternalStore(
    subscribe,
    () => current,
    () => null,
  );
}
