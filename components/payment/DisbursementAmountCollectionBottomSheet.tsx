"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ChangeEvent,
} from "react";

import { MIN_DOWN_PAYMENT_INR, ON_ROAD_PRICE_INR } from "@/components/payment/loan-amount-demo-constants";
import { PAYMENT_CHOOSE_ASSETS } from "@/components/payment/payment-choose-assets";
import {
  BOTTOM_SHEET_BODY_BEFORE_CTA_CLASS,
  BOTTOM_SHEET_CTA_STRIP_TOP_CLASS,
  BOTTOM_SHEET_MAX_HEIGHT_CLASS,
} from "@/components/ui/bottom-sheet-layout";
import { bottomSheetTitleWidthWithIllustration } from "@/components/ui/bottom-sheet-title-layout";
import { BottomSheetCloseIcon } from "@/components/ui/BottomSheetCloseIcon";

/** Parity with `SelfFinanceConfirmBottomSheet` / `BankSelectionBottomSheet`. */
const SHEET_TRANSITION_MS = 280;

const MAX_DISBURSEMENT_INR = ON_ROAD_PRICE_INR - MIN_DOWN_PAYMENT_INR;

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Whole rupees only; cap at demo max — no step rounding. */
function capDisbursementInr(value: number) {
  return Math.min(MAX_DISBURSEMENT_INR, Math.max(0, value));
}

/** Caret position after the `n`th digit in a formatted currency string (`n` = count of digits to the left of caret). */
function indexAfterNthDigit(formatted: string, n: number): number {
  if (n <= 0) return 0;
  let digitCount = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i]!)) {
      digitCount += 1;
      if (digitCount === n) return i + 1;
    }
  }
  return formatted.length;
}

const DEFAULT_SHEET_TITLE = "Enter your disbursement amount";
const DEFAULT_PRIMARY_CTA_LABEL = "Calculate my down payment";

type DisbursementAmountCollectionBottomSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Called with the entered disbursement amount in whole rupees when the user continues. */
  onSubmitAmount: (disbursementAmountInr: number) => void;
  /** Overrides default sheet headline. */
  title?: string;
  /** Overrides primary button label. */
  primaryCtaLabel?: string;
  /** Prefill the amount field when the sheet opens (whole rupees). */
  initialDisbursementInr?: number | null;
};

/**
 * Bottom sheet to collect the bank-approved disbursement amount before down-payment calculation.
 */
export function DisbursementAmountCollectionBottomSheet({
  open,
  onClose,
  onSubmitAmount,
  title = DEFAULT_SHEET_TITLE,
  primaryCtaLabel = DEFAULT_PRIMARY_CTA_LABEL,
  initialDisbursementInr = null,
}: DisbursementAmountCollectionBottomSheetProps) {
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);
  /** Digit-only buffer (no grouping); display is always formatted when non-empty. */
  const [amountDigits, setAmountDigits] = useState("");
  const exitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);
  /** Count of digits to the left of caret after last edit (for caret restore after format). */
  const pendingCaretDigitCountRef = useRef<number | null>(null);

  /** Mount + slide-up (`translate-y`) — keep deps to `open` only so prefill updates never reset animation. */
  useEffect(() => {
    if (!open) return;
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
    setMounted(true);
    setAnimateIn(false);
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimateIn(true));
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  /** Prefill / sync digits when opening or when `initialDisbursementInr` changes while open. */
  useEffect(() => {
    if (!open) return;
    const prefill =
      initialDisbursementInr != null &&
      Number.isFinite(initialDisbursementInr) &&
      initialDisbursementInr > 0
        ? String(capDisbursementInr(Math.trunc(initialDisbursementInr)))
        : "";
    setAmountDigits(prefill);
    pendingCaretDigitCountRef.current = null;
  }, [open, initialDisbursementInr]);

  useEffect(() => {
    if (open || !mounted) return;
    setAnimateIn(false);
    exitTimeoutRef.current = setTimeout(() => {
      exitTimeoutRef.current = null;
      setMounted(false);
    }, SHEET_TRANSITION_MS);
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current);
        exitTimeoutRef.current = null;
      }
    };
  }, [open, mounted]);

  useEffect(() => {
    if (!mounted) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mounted]);

  const onAmountChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const el = e.target;
    const raw = el.value.replace(/\D/g, "");
    let nextDigits = raw;
    if (nextDigits !== "") {
      const n = Number(nextDigits);
      if (Number.isFinite(n) && n > MAX_DISBURSEMENT_INR) {
        nextDigits = String(MAX_DISBURSEMENT_INR);
      }
    }
    const digitCountLeftOfCaret = el.value.slice(0, el.selectionStart ?? 0).replace(/\D/g, "").length;
    pendingCaretDigitCountRef.current = digitCountLeftOfCaret;
    setAmountDigits(nextDigits);
  }, []);

  const disbursementAmountInr =
    amountDigits === "" ? 0 : capDisbursementInr(Number(amountDigits));

  const amountInputDisplayValue = amountDigits === "" ? "" : formatInr(disbursementAmountInr);

  useLayoutEffect(() => {
    const el = amountInputRef.current;
    const n = pendingCaretDigitCountRef.current;
    if (el == null || n === null || document.activeElement !== el) return;
    pendingCaretDigitCountRef.current = null;
    const display = amountInputDisplayValue;
    const digitTarget = Math.min(n, (display.match(/\d/g) ?? []).length);
    const pos = indexAfterNthDigit(display, digitTarget);
    el.setSelectionRange(pos, pos);
  }, [amountInputDisplayValue, amountDigits]);

  const handlePrimaryCta = useCallback(() => {
    if (disbursementAmountInr <= 0) return;
    onSubmitAmount(disbursementAmountInr);
  }, [disbursementAmountInr, onSubmitAmount]);

  const primaryCtaDisabled = disbursementAmountInr <= 0;

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      <button
        type="button"
        className={`absolute inset-0 bg-black/90 transition-opacity duration-[280ms] ease-out motion-reduce:opacity-100 motion-reduce:transition-none ${
          animateIn ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
        aria-label="Dismiss"
      />
      <div
        className={`absolute bottom-0 left-1/2 z-10 flex ${BOTTOM_SHEET_MAX_HEIGHT_CLASS} w-full max-w-[640px] -translate-x-1/2 flex-col overflow-hidden rounded-t-[20px] bg-white shadow-[0_-8px_24px_rgba(0,0,0,0.12)] transition-transform duration-[280ms] ease-out motion-reduce:translate-y-0 motion-reduce:transition-none ${
          animateIn ? "translate-y-0" : "translate-y-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="disbursement-collection-title"
        aria-describedby="disbursement-collection-body disbursement-amount-field-hint"
      >
        <div className="relative flex min-h-0 flex-1 flex-col">
          <button
            type="button"
            onClick={onClose}
            className="cta-ghost absolute right-5 top-6 z-10 flex h-10 w-10 items-center justify-center rounded-lg text-[#121212] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
            aria-label="Close"
          >
            <BottomSheetCloseIcon />
          </button>

          <div className={`min-h-0 flex-1 overflow-y-auto px-5 pt-6 ${BOTTOM_SHEET_BODY_BEFORE_CTA_CLASS}`}>
            <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden bg-white" aria-hidden>
              <Image
                src={PAYMENT_CHOOSE_ASSETS.sanctionedAmount}
                alt=""
                width={72}
                height={72}
                className="h-[72px] w-[72px] object-contain"
                unoptimized
                sizes="72px"
              />
            </div>
            <h2
              id="disbursement-collection-title"
              className={`mt-[24px] ${bottomSheetTitleWidthWithIllustration} text-left text-[20px] font-semibold leading-[28px] tracking-[-0.12px] text-[#121212]`}
            >
              {title}
            </h2>
            <p
              id="disbursement-collection-body"
              className="mt-3 w-full text-left text-sm font-normal leading-[22px] text-[#4b4b4b]"
            >
              This is the loan amount your bank will transfer to the dealer. It&apos;s usually your
              sanctioned amount minus any processing fees.
            </p>

            <p id="disbursement-amount-field-hint" className="sr-only">
              Type digits only; amount is shown in Indian Rupees.
            </p>
            <div className="mt-6 w-full">
              <label htmlFor="disbursement-amount-input" className="sr-only">
                Disbursement amount in rupees
              </label>
              <div className="flex h-12 min-h-12 w-full shrink-0 items-center rounded-lg border border-[#e8e8e8] bg-white px-4">
                <input
                  ref={amountInputRef}
                  id="disbursement-amount-input"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={amountInputDisplayValue}
                  onChange={onAmountChange}
                  placeholder="Enter the amount"
                  aria-describedby="disbursement-amount-field-hint"
                  className="min-w-0 w-full border-0 bg-transparent p-0 text-[18px] font-semibold leading-[22px] text-[#121212] caret-[#121212] outline-none placeholder:text-[#9e9e9e] placeholder:font-normal [field-sizing:content] focus:ring-0 tabular-nums"
                />
              </div>
            </div>
          </div>

          <div
            className={`shrink-0 space-y-3 bg-white px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] ${BOTTOM_SHEET_CTA_STRIP_TOP_CLASS}`}
          >
            <button
              type="button"
              onClick={handlePrimaryCta}
              disabled={primaryCtaDisabled}
              className="primary-cta w-full"
            >
              {primaryCtaLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
