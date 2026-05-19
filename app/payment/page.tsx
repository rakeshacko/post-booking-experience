"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { DefaultPageTransition } from "@/components/ui/page-transition";

import { BOOKING_LOCK_AMOUNT_INR, buildDownPaymentSuccessHref } from "@/lib/paymentUrls";

/** No artificial delay before navigation to the dedicated success page. */
const PROCESSING_MS = 0;

type Phase = "checkout" | "processing";

const PAYMENT_LEDGER_STORAGE_KEY = "pbe_down_payment_ledger_v1";

/** Minimum amount (₹) user can pay in one instalment on the mock checkout. */
const MIN_PAYMENT_INR = 1;

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function parseDownPaymentTotalFromSearchParams(searchParams: URLSearchParams): number {
  const raw = searchParams.get("down_payment");
  const n = raw != null && raw !== "" ? Number(raw) : NaN;
  if (Number.isFinite(n) && n > 0) return Math.round(n);
  return BOOKING_LOCK_AMOUNT_INR;
}

function readStoredRemaining(totalDue: number): number {
  if (typeof window === "undefined") return totalDue;
  try {
    const raw = sessionStorage.getItem(PAYMENT_LEDGER_STORAGE_KEY);
    if (!raw) return totalDue;
    const parsed = JSON.parse(raw) as { totalDue?: number; remaining?: number };
    if (parsed.totalDue !== totalDue) return totalDue;
    const r = Number(parsed.remaining);
    if (!Number.isFinite(r)) return totalDue;
    const clamped = Math.min(totalDue, Math.max(0, Math.round(r)));
    /**
     * After a full pay-down, we clear storage on success — but older sessions (or manual
     * navigation back) may still have `remaining: 0`. Treat that as stale so the mock
     * checkout can be used again; otherwise the amount field stays disabled.
     */
    if (clamped === 0 && totalDue > 0) {
      sessionStorage.removeItem(PAYMENT_LEDGER_STORAGE_KEY);
      return totalDue;
    }
    return clamped;
  } catch {
    return totalDue;
  }
}

function writeStoredRemaining(totalDue: number, remaining: number): void {
  if (typeof window === "undefined") return;
  try {
    if (remaining <= 0) {
      sessionStorage.removeItem(PAYMENT_LEDGER_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(
      PAYMENT_LEDGER_STORAGE_KEY,
      JSON.stringify({ totalDue, remaining }),
    );
  } catch {
    /* ignore quota / private mode */
  }
}

/** Digits only; empty → NaN. */
function parseInrInputDigits(value: string): number {
  const digits = value.replace(/\D/g, "");
  if (digits === "") return NaN;
  const n = Number(digits);
  return Number.isFinite(n) ? n : NaN;
}

/**
 * Mock Razorpay-style checkout for demos only — not connected to Razorpay APIs.
 * Pay → loader → dedicated success route (`/payment/booking-success` or `/payment/down-payment-success`).
 * Booking flow: `/payment` (no `down_payment`) — fixed booking lock, read-only.
 * Down payment flow: `?down_payment=` (e.g. from pay-down-payment) — editable amount / instalments (demo).
 */
function MockRazorpayPaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pendingSuccessHref = useRef<string | null>(null);

  const checkoutMeta = useMemo(() => {
    const raw = searchParams.get("down_payment");
    const n = raw != null && raw !== "" ? Number(raw) : NaN;
    const hasDownPaymentParam = Number.isFinite(n) && n > 0;
    const due = hasDownPaymentParam
      ? parseDownPaymentTotalFromSearchParams(searchParams)
      : BOOKING_LOCK_AMOUNT_INR;
    const origRaw = searchParams.get("original_down_payment");
    const origN = origRaw != null && origRaw !== "" ? Number(origRaw) : NaN;
    const originalDownPayment =
      hasDownPaymentParam && Number.isFinite(origN) && origN > 0 ? Math.round(origN) : due;
    return {
      totalDue: due,
      originalDownPayment,
      checkoutSubtitle: hasDownPaymentParam
        ? "Down payment · incl. applicable taxes"
        : "Booking lock amount · incl. applicable taxes",
      isDownPaymentFromUrl: hasDownPaymentParam,
    };
  }, [searchParams]);

  const { totalDue, originalDownPayment, checkoutSubtitle, isDownPaymentFromUrl } = checkoutMeta;

  const [remainingDue, setRemainingDue] = useState(totalDue);
  const [amountInput, setAmountInput] = useState("");
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  const [phase, setPhase] = useState<Phase>("checkout");

  useEffect(() => {
    if (!isDownPaymentFromUrl) return;
    setRemainingDue(readStoredRemaining(totalDue));
  }, [totalDue, isDownPaymentFromUrl]);

  useEffect(() => {
    if (!isDownPaymentFromUrl || phase !== "checkout") return;
    setAmountInput(String(remainingDue));
    setCheckoutError(null);
  }, [remainingDue, phase, isDownPaymentFromUrl]);

  const parsedPayAmount = useMemo(
    () => parseInrInputDigits(amountInput),
    [amountInput],
  );

  const isPayAmountValid = useMemo(() => {
    if (!isDownPaymentFromUrl) return true;
    if (remainingDue <= 0) return false;
    if (!Number.isFinite(parsedPayAmount)) return false;
    if (parsedPayAmount < MIN_PAYMENT_INR) return false;
    if (parsedPayAmount > remainingDue) return false;
    return true;
  }, [isDownPaymentFromUrl, parsedPayAmount, remainingDue]);

  useEffect(() => {
    if (phase !== "processing") return;
    const href = pendingSuccessHref.current;
    if (href == null) return;
    const id = window.setTimeout(() => {
      router.push(href);
      pendingSuccessHref.current = null;
    }, PROCESSING_MS);
    return () => window.clearTimeout(id);
  }, [phase, router]);

  const handleAmountInputChange = useCallback((raw: string) => {
    setCheckoutError(null);
    const digits = raw.replace(/\D/g, "");
    setAmountInput(digits);
  }, []);

  const handlePayFullChip = useCallback(() => {
    setCheckoutError(null);
    setAmountInput(String(remainingDue));
  }, [remainingDue]);

  const handlePayHalfChip = useCallback(() => {
    setCheckoutError(null);
    const half = Math.max(MIN_PAYMENT_INR, Math.floor(remainingDue / 2));
    setAmountInput(String(Math.min(half, remainingDue)));
  }, [remainingDue]);

  const handlePay = useCallback(() => {
    if (!isDownPaymentFromUrl) {
      setCheckoutError(null);
      pendingSuccessHref.current = "/payment/booking-success";
      if (PROCESSING_MS <= 0) {
        router.push(pendingSuccessHref.current);
        return;
      }
      setPhase("processing");
      return;
    }

    setCheckoutError(null);
    const n = parseInrInputDigits(amountInput);
    if (!Number.isFinite(n)) {
      setCheckoutError("Enter a valid amount.");
      return;
    }
    if (n < MIN_PAYMENT_INR) {
      setCheckoutError(`Minimum payment is ${formatInr(MIN_PAYMENT_INR)}.`);
      return;
    }
    if (n > remainingDue) {
      setCheckoutError(`You can pay up to ${formatInr(remainingDue)} this time.`);
      return;
    }
    const remainingAfter = Math.max(0, remainingDue - n);
    writeStoredRemaining(totalDue, remainingAfter);
    setRemainingDue(remainingAfter);
    pendingSuccessHref.current = buildDownPaymentSuccessHref({
      bank: searchParams.get("bank"),
      loanAmount: searchParams.get("loan_amount"),
      originalDownPaymentInr: originalDownPayment,
      paidThisInstalment: n,
      remainingAfter,
    });
    if (PROCESSING_MS <= 0) {
      router.push(pendingSuccessHref.current);
      return;
    }
    setPhase("processing");
  }, [amountInput, isDownPaymentFromUrl, originalDownPayment, remainingDue, router, searchParams]);

  if (phase === "processing") {
    return (
      <DefaultPageTransition>
        <div className="fixed inset-0 z-50 flex min-h-dvh flex-col items-center justify-center bg-[#f5f6f8] font-sans">
          <div
            className="h-12 w-12 animate-spin rounded-full border-[3px] border-[#e6e8eb] border-t-[#3395ff]"
            aria-hidden
          />
          <p className="mt-6 text-base font-medium text-[#1a1a1a]">Processing payment…</p>
          <p className="mt-1 text-sm text-[#6b7280]">Please do not close this screen</p>
        </div>
      </DefaultPageTransition>
    );
  }

  return (
    <DefaultPageTransition>
      <div className="min-h-dvh bg-[#f5f6f8] font-sans">
        <KycTopNavHeader title="Checkout" />

        <main className="mx-auto w-full max-w-[400px] px-4 pb-32 pt-4">
        <div className="overflow-hidden rounded-xl border border-[#e6e8eb] bg-white shadow-sm">
          <div className="border-b border-[#e6e8eb] bg-[#fafbfc] px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280]">
                  Pay using Razorpay
                </p>
                <p className="mt-1 text-sm font-semibold text-[#1a1a1a]">ACKO Drive</p>
              </div>
              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-bold text-white"
                style={{ background: "linear-gradient(135deg, #3395ff 0%, #0b6bcb 100%)" }}
                aria-hidden
              >
                R
              </div>
            </div>
          </div>

          <div className="px-4 py-6">
            {isDownPaymentFromUrl ? (
              <>
                <p className="text-center text-xs text-[#6b7280]">Amount to pay now</p>
                <div className="mt-2 flex justify-center">
                  <label htmlFor="checkout-pay-amount" className="sr-only">
                    Amount to pay now in rupees
                  </label>
                  <div className="flex items-baseline gap-1 rounded-xl border border-[#e6e8eb] bg-[#fafbfc] px-4 py-3">
                    <span className="text-2xl font-semibold text-[#6b7280]" aria-hidden>
                      ₹
                    </span>
                    <input
                      id="checkout-pay-amount"
                      type="text"
                      inputMode="numeric"
                      autoComplete="off"
                      value={amountInput}
                      onChange={(e) => handleAmountInputChange(e.target.value)}
                      disabled={remainingDue <= 0}
                      className="w-[min(100%,12rem)] border-0 bg-transparent text-center text-3xl font-semibold tabular-nums tracking-tight text-[#1a1a1a] outline-none ring-0 placeholder:text-[#9ca3af] disabled:cursor-not-allowed disabled:opacity-50"
                      placeholder="0"
                      aria-invalid={checkoutError != null}
                      aria-describedby={checkoutError ? "checkout-pay-error" : "checkout-pay-hint"}
                    />
                  </div>
                </div>
                {checkoutError ? (
                  <p
                    id="checkout-pay-error"
                    role="alert"
                    className="mt-2 text-center text-xs font-medium text-[#dc2626]"
                  >
                    {checkoutError}
                  </p>
                ) : (
                  <p id="checkout-pay-hint" className="mt-2 text-center text-xs text-[#9ca3af]">
                    {remainingDue <= 0
                      ? "Nothing left to pay for this total."
                      : `Between ${formatInr(MIN_PAYMENT_INR)} and ${formatInr(remainingDue)}.`}
                  </p>
                )}
                <p className="mt-3 text-center text-xs text-[#6b7280]">{checkoutSubtitle}</p>
                <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-center text-xs text-[#6b7280]">
                  <span>Down payment (plan) {formatInr(originalDownPayment)}</span>
                  {remainingDue < originalDownPayment ? (
                    <>
                      <span aria-hidden className="text-[#d1d5db]">
                        ·
                      </span>
                      <span>Remaining {formatInr(remainingDue)}</span>
                    </>
                  ) : null}
                </div>
                {remainingDue > MIN_PAYMENT_INR ? (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    <button
                      type="button"
                      onClick={handlePayFullChip}
                      className="rounded-full border border-[#e6e8eb] bg-white px-3 py-1.5 text-xs font-medium text-[#1a1a1a] shadow-sm transition hover:border-[#3395ff] hover:bg-[#f0f7ff] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#3395ff] focus-visible:ring-offset-2"
                    >
                      Pay full ({formatInr(remainingDue)})
                    </button>
                    <button
                      type="button"
                      onClick={handlePayHalfChip}
                      className="rounded-full border border-[#e6e8eb] bg-white px-3 py-1.5 text-xs font-medium text-[#1a1a1a] shadow-sm transition hover:border-[#3395ff] hover:bg-[#f0f7ff] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#3395ff] focus-visible:ring-offset-2"
                    >
                      Pay half
                    </button>
                  </div>
                ) : null}
              </>
            ) : (
              <>
                <p className="text-center text-xs text-[#6b7280]">Amount payable</p>
                <p className="mt-1 text-center text-3xl font-semibold tabular-nums tracking-tight text-[#1a1a1a]">
                  {formatInr(BOOKING_LOCK_AMOUNT_INR)}
                </p>
                <p className="mt-2 text-center text-xs text-[#9ca3af]">{checkoutSubtitle}</p>
              </>
            )}
          </div>

          <div className="border-t border-[#e6e8eb] px-4 py-4">
            <p className="text-xs font-medium text-[#6b7280]">Payment method</p>
            <div className="mt-3 flex gap-2">
              {(["Card", "UPI", "Netbanking"] as const).map((label, i) => (
                <span
                  key={label}
                  className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                    i === 0
                      ? "border-[#3395ff] bg-[#f0f7ff] text-[#0b6bcb]"
                      : "border-[#e6e8eb] bg-[#fafbfc] text-[#9ca3af]"
                  }`}
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-4 rounded-lg border border-dashed border-[#e6e8eb] bg-[#fafbfc] px-3 py-8 text-center text-sm text-[#9ca3af]">
              Card form (static mock)
            </div>
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-[#9ca3af]">
          This is a non-functional demo screen. No payment is processed.
        </p>
      </main>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#e6e8eb] bg-white px-4 py-4 shadow-[0_-4px_24px_rgba(0,0,0,0.06)]">
        <div className="mx-auto w-full max-w-[400px]">
          <button
            type="button"
            onClick={handlePay}
            disabled={!isPayAmountValid}
            className="primary-cta focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#3395ff] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isDownPaymentFromUrl &&
            isPayAmountValid &&
            Number.isFinite(parsedPayAmount)
              ? `Pay ${formatInr(parsedPayAmount)}`
              : "Pay"}
          </button>
        </div>
      </div>
      </div>
    </DefaultPageTransition>
  );
}

export default function MockRazorpayPaymentPage() {
  return (
    <Suspense fallback={null}>
      <MockRazorpayPaymentPageContent />
    </Suspense>
  );
}
