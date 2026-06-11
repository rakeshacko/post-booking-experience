"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";

import { GetHelpPillButton } from "@/components/kyc/GetHelpPillButton";
import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import {
  BANK_SHEET_OPTIONS,
  PAYMENT_CHOOSE_ASSETS,
} from "@/components/payment/payment-choose-assets";
import {
  DEFAULT_TENURE_MONTHS,
  FULL_PAYMENT_INSURANCE_INR,
  MIN_LOAN_INR,
  ON_ROAD_PRICE_INR,
  SLIDER_STEP,
} from "@/components/payment/loan-amount-demo-constants";
import { ChooseLoanPaymentSummaryCard } from "@/components/payment/ChooseLoanPaymentSummaryCard";
import { LoanSubmitConfirmBottomSheet } from "@/components/payment/LoanSubmitConfirmBottomSheet";
import {
  estimateMonthlyEmiInr,
  formatInrAmountDigits,
  parseAnnualRateFromLabel,
  parseInrAmountInput,
} from "@/lib/loan-emi";

/** Stagger: nav + CTA immediate; then title → card → warning (`payment-success-stagger` in globals). */
const STAGGER_TITLE_MS = 90;
const STAGGER_SUBTEXT_MS = 120;
const STAGGER_AMOUNT_ROW_MS = 220;
const STAGGER_SLIDER_MS = 320;
const STAGGER_SUMMARY_CARD_MS = 440;
const STAGGER_PAYMENT_SUMMARY_MS = 560;

/** Car down payment due date — aligned with enter-sanctioned screen (Figma 2331:10371). */
const CAR_DOWN_PAYMENT_DUE_LABEL = "24 Apr 2026";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatInrLakhLabel(amount: number) {
  if (amount >= 100_000) {
    const lakhs = amount / 100_000;
    const n = lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1);
    return `₹${n} lakh`;
  }
  return formatInr(amount);
}

function resolveBank(bankId: string | null) {
  if (bankId && BANK_SHEET_OPTIONS.some((b) => b.id === bankId)) {
    return BANK_SHEET_OPTIONS.find((b) => b.id === bankId)!;
  }
  return BANK_SHEET_OPTIONS[0];
}

/** Default loan when down payment would be ₹3L — keeps prior demo behaviour. */
const DEFAULT_LOAN_INR = ON_ROAD_PRICE_INR - 300_000;

function clampLoanAmount(value: number) {
  const stepped = Math.round(value / SLIDER_STEP) * SLIDER_STEP;
  return Math.min(ON_ROAD_PRICE_INR, Math.max(MIN_LOAN_INR, stepped));
}

/**
 * Choose loan amount vs down payment after loan sanction (Figma 2111:7963).
 * Single loan-amount slider; down payment = on-road − loan; sticky CTA.
 */
export function ChooseLoanAmountScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bankId = searchParams.get("bank");

  const bank = useMemo(() => resolveBank(bankId), [bankId]);

  const [loanAmount, setLoanAmount] = useState(() => clampLoanAmount(DEFAULT_LOAN_INR));
  const [loanAmountInput, setLoanAmountInput] = useState(() =>
    formatInrAmountDigits(clampLoanAmount(DEFAULT_LOAN_INR)),
  );
  const [confirmSheetOpen, setConfirmSheetOpen] = useState(false);

  const applyLoanAmount = useCallback((amount: number) => {
    const clamped = clampLoanAmount(amount);
    setLoanAmount(clamped);
    setLoanAmountInput(formatInrAmountDigits(clamped));
  }, []);

  const downPayment = Math.max(0, ON_ROAD_PRICE_INR - loanAmount);
  const carDownPaymentPortionInr = Math.max(0, downPayment - FULL_PAYMENT_INSURANCE_INR);

  const annualRate = useMemo(() => parseAnnualRateFromLabel(bank.rate), [bank.rate]);

  const estimatedEmi = useMemo(
    () => estimateMonthlyEmiInr(loanAmount, DEFAULT_TENURE_MONTHS, annualRate),
    [annualRate, loanAmount],
  );

  const onLoanRangeChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      applyLoanAmount(Number(e.target.value));
    },
    [applyLoanAmount],
  );

  const onLoanAmountInputChange = useCallback((raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (digits.length === 0) {
      setLoanAmountInput("");
      return;
    }
    const parsed = parseInrAmountInput(raw);
    const capped = Math.min(ON_ROAD_PRICE_INR, parsed);
    setLoanAmountInput(formatInrAmountDigits(capped));
    if (capped >= MIN_LOAN_INR) {
      setLoanAmount(clampLoanAmount(capped));
    }
  }, []);

  const onLoanAmountBlur = useCallback(() => {
    const parsed = parseInrAmountInput(loanAmountInput);
    if (loanAmountInput === "" || parsed < MIN_LOAN_INR) {
      applyLoanAmount(parsed > 0 ? parsed : DEFAULT_LOAN_INR);
      return;
    }
    applyLoanAmount(parsed);
  }, [applyLoanAmount, loanAmountInput]);

  const navigateToPayment = useCallback(() => {
    const q = new URLSearchParams();
    if (bankId) q.set("bank", bankId);
    q.set("loan_amount", String(loanAmount));
    q.set("down_payment", String(downPayment));
    router.push(`/payment/pay-down-payment?${q.toString()}`);
  }, [router, bankId, loanAmount, downPayment]);

  const onConfirmFromSheet = useCallback(() => {
    setConfirmSheetOpen(false);
    navigateToPayment();
  }, [navigateToPayment]);

  useEffect(() => {
    router.prefetch("/payment/pay-down-payment");
    router.prefetch("/payment");
  }, [router]);

  const sliderSpan = ON_ROAD_PRICE_INR - MIN_LOAN_INR;
  const fillPct =
    sliderSpan > 0 ? ((loanAmount - MIN_LOAN_INR) / sliderSpan) * 100 : 0;

  return (
    <div className="min-h-dvh bg-[#f1f0f5] font-sans">
      <KycTopNavHeader endSlot={<GetHelpPillButton />} />

      <main className="mx-auto w-full max-w-[640px] px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-[8px]">
        <h1
          className="payment-success-stagger text-2xl font-semibold leading-8 tracking-[-0.1px] text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          Choose your loan amount
        </h1>

        <p
          className="payment-success-stagger mt-2 flex flex-wrap items-center gap-1.5"
          style={{ animationDelay: `${STAGGER_SUBTEXT_MS}ms` }}
        >
          <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-sm bg-white">
            <Image
              src={bank.logoSrc}
              alt=""
              width={20}
              height={20}
              className="object-contain"
              unoptimized
              sizes="20px"
            />
          </span>
          <span className="text-xs font-normal leading-[18px] text-[#121212]">{bank.name}</span>
          <span className="relative h-4 w-4 shrink-0" aria-hidden>
            <Image
              src={BOOKING_CONFIRMED_ASSETS.dotSeparator}
              alt=""
              width={16}
              height={16}
              className="object-contain"
              unoptimized
              sizes="16px"
            />
          </span>
          <span className="text-xs font-normal leading-[18px] text-[#121212]">{bank.rate.replace(/\.$/, "")}</span>
          <span className="relative h-4 w-4 shrink-0" aria-hidden>
            <Image
              src={BOOKING_CONFIRMED_ASSETS.dotSeparator}
              alt=""
              width={16}
              height={16}
              className="object-contain"
              unoptimized
              sizes="16px"
            />
          </span>
          <span className="text-xs font-normal leading-[18px] text-[#121212]">
            {DEFAULT_TENURE_MONTHS} months
          </span>
        </p>

        <div
          className="payment-success-stagger mt-8 flex items-center gap-4"
          style={{ animationDelay: `${STAGGER_AMOUNT_ROW_MS}ms` }}
        >
          <div className="flex h-12 min-h-12 w-[174px] max-w-full shrink-0 items-center rounded-lg bg-white card-elevated px-4">
            <label htmlFor="choose-loan-amount-input" className="sr-only">
              Loan amount in rupees
            </label>
            <span
              className="shrink-0 text-base font-medium leading-6 text-[#040222]"
              aria-hidden
            >
              ₹{loanAmountInput.length > 0 ? "\u00a0" : ""}
            </span>
            <input
              id="choose-loan-amount-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={loanAmountInput}
              onChange={(e) => onLoanAmountInputChange(e.target.value)}
              onBlur={onLoanAmountBlur}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-medium leading-6 text-[#040222] outline-none focus:ring-0 tabular-nums"
            />
          </div>
          <div className="flex h-12 min-h-12 min-w-0 flex-1 items-center rounded-lg bg-[#f5f5f5] px-4">
            <span className="min-w-0 truncate text-sm font-normal leading-5 text-[#040222]">
              EMI: {formatInr(estimatedEmi)}
            </span>
          </div>
        </div>

        <div
          className="payment-success-stagger mt-8"
          style={{ animationDelay: `${STAGGER_SLIDER_MS}ms` }}
        >
          <label className="block" htmlFor="loan-amount-range">
            <input
              id="loan-amount-range"
              type="range"
              className="choose-loan-down-range h-2 w-full cursor-pointer rounded-full"
              min={MIN_LOAN_INR}
              max={ON_ROAD_PRICE_INR}
              step={SLIDER_STEP}
              value={loanAmount}
              onChange={onLoanRangeChange}
              style={{
                background: `linear-gradient(to right, #121212 0%, #121212 ${fillPct}%, #e7e7e7 ${fillPct}%, #e7e7e7 100%)`,
              }}
            />
            <div className="mt-2 flex justify-between text-xs leading-[18px] text-[#4b4b4b]">
              <span>{formatInrLakhLabel(MIN_LOAN_INR)}</span>
              <span className="text-right">{formatInrLakhLabel(ON_ROAD_PRICE_INR)}</span>
            </div>
          </label>
        </div>

        <section
          className="payment-success-stagger mt-8 overflow-hidden rounded-2xl border border-[#e3f0e5] bg-gradient-to-b from-white to-[#e7ffee]"
          style={{ animationDelay: `${STAGGER_SUMMARY_CARD_MS}ms` }}
          aria-label="Down payment amount and split"
        >
          <div className="flex gap-3 px-[15px] pb-3 pt-[15px]">
            <div
              className="relative flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#e4f6e7]"
              aria-hidden
            >
              <Image
                src={PAYMENT_CHOOSE_ASSETS.paymentSummary}
                alt=""
                width={24}
                height={24}
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-normal leading-[18px] text-[#121212]">Down payment amount</p>
              <p className="mt-0.5 text-[18px] font-medium leading-7 tracking-[-0.1px] text-[#121212]">
                {formatInr(downPayment)}
              </p>
            </div>
          </div>

          <hr className="border-0 border-t border-[#d5e5d8]" />

          <div className="px-[15px] pb-4 pt-3">
            <p className="text-xs font-normal leading-[18px] text-[#4b4b4b]">
              Your down payment is split into two parts
            </p>
            <ul className="mt-3 space-y-3">
              <li className="flex gap-1">
                <span className="relative mt-0.5 h-4 w-4 shrink-0" aria-hidden>
                  <Image
                    src={BOOKING_CONFIRMED_ASSETS.dotSeparator}
                    alt=""
                    width={16}
                    height={16}
                    className="object-contain"
                    unoptimized
                    sizes="16px"
                  />
                </span>
                <p className="min-w-0 text-xs leading-[18px] text-[#4b4b4b]">
                  <span className="font-medium text-[#121212]">{formatInr(carDownPaymentPortionInr)} car down payment.</span>{" "}
                  Pay by {CAR_DOWN_PAYMENT_DUE_LABEL} to keep booking active
                </p>
              </li>
              <li className="flex gap-1">
                <span className="relative mt-0.5 h-4 w-4 shrink-0" aria-hidden>
                  <Image
                    src={BOOKING_CONFIRMED_ASSETS.dotSeparator}
                    alt=""
                    width={16}
                    height={16}
                    className="object-contain"
                    unoptimized
                    sizes="16px"
                  />
                </span>
                <p className="min-w-0 text-xs leading-[18px] text-[#4b4b4b]">
                  <span className="font-medium text-[#121212]">{formatInr(FULL_PAYMENT_INSURANCE_INR)} insurance amount.</span>{" "}
                  Pay later, just before delivery — it&apos;s needed for RTO registration
                </p>
              </li>
            </ul>
          </div>
        </section>

        <div
          className="payment-success-stagger mt-8"
          style={{ animationDelay: `${STAGGER_PAYMENT_SUMMARY_MS}ms` }}
        >
          <h2 className="text-base font-medium leading-6 text-[#121212]">Payment summary</h2>
          <div className="mt-4">
            <ChooseLoanPaymentSummaryCard
              loanAmountInr={loanAmount}
              downPaymentAmountInr={downPayment}
            />
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)]">
        <div className="mx-auto w-full max-w-[640px] bg-white px-5 py-4">
          <button
            type="button"
            onClick={() => setConfirmSheetOpen(true)}
            className="primary-cta w-full"
          >
            Confirm loan amount
          </button>
        </div>
      </div>

      <LoanSubmitConfirmBottomSheet
        open={confirmSheetOpen}
        onClose={() => setConfirmSheetOpen(false)}
        onConfirm={onConfirmFromSheet}
      />
    </div>
  );
}
