"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";

import { GetHelpPillButton } from "@/components/kyc/GetHelpPillButton";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import {
  BANK_SHEET_OPTIONS,
  PAYMENT_CHOOSE_ASSETS,
} from "@/components/payment/payment-choose-assets";
import {
  DEFAULT_TENURE_MONTHS,
  MIN_DOWN_PAYMENT_INR,
  ON_ROAD_PRICE_INR,
  SLIDER_STEP,
} from "@/components/payment/loan-amount-demo-constants";
import { LoanSubmitConfirmBottomSheet } from "@/components/payment/LoanSubmitConfirmBottomSheet";

/** Stagger: nav + CTA immediate; then title → card → warning (`payment-success-stagger` in globals). */
const STAGGER_TITLE_MS = 90;
const STAGGER_CARD_MS = 300;
const STAGGER_WARNING_MS = 540;

/** Matches `Warning.svg` shape; stroke #D16900 (quote timer / Figma yellow band). */
function DownPaymentNoticeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={24}
      height={24}
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden
    >
      <path
        d="M2.5 10C2.5 6.46316 2.5 4.69474 3.59737 3.59737C4.69474 2.5 6.46316 2.5 10 2.5C13.5368 2.5 15.3053 2.5 16.4026 3.59737C17.5 4.69474 17.5 6.46316 17.5 10C17.5 13.5368 17.5 15.3053 16.4026 16.4026C15.3053 17.5 13.5368 17.5 10 17.5C6.46316 17.5 4.69474 17.5 3.59737 16.4026C2.5 15.3053 2.5 13.5368 2.5 10Z"
        stroke="#D16900"
        strokeWidth={1.25}
      />
      <path
        d="M10 10.5843V6.05273"
        stroke="#D16900"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 13.3246V12.5352"
        stroke="#D16900"
        strokeWidth={1.25}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

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

function clampDownPayment(value: number) {
  const stepped = Math.round(value / SLIDER_STEP) * SLIDER_STEP;
  return Math.min(ON_ROAD_PRICE_INR, Math.max(MIN_DOWN_PAYMENT_INR, stepped));
}

/**
 * Choose loan amount vs down payment after loan sanction (Figma 2111:7963).
 * Single down-payment slider; loan = on-road − down; sticky CTA.
 */
export function ChooseLoanAmountScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bankId = searchParams.get("bank");

  const bank = useMemo(() => resolveBank(bankId), [bankId]);

  const [downPayment, setDownPayment] = useState(() =>
    clampDownPayment(300_000),
  );
  const [confirmSheetOpen, setConfirmSheetOpen] = useState(false);

  const loanAmount = Math.max(0, ON_ROAD_PRICE_INR - downPayment);

  const onDownRangeChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    setDownPayment(clampDownPayment(Number(e.target.value)));
  }, []);

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

  const sliderSpan = ON_ROAD_PRICE_INR - MIN_DOWN_PAYMENT_INR;
  const fillPct =
    sliderSpan > 0 ? ((downPayment - MIN_DOWN_PAYMENT_INR) / sliderSpan) * 100 : 0;

  return (
    <div className="min-h-dvh bg-white font-sans">
      <KycTopNavHeader transparent endSlot={<GetHelpPillButton />} />

      <main className="mx-auto w-full max-w-[360px] px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-[8px]">
        <h1
          className="payment-success-stagger text-2xl font-semibold leading-8 tracking-[-0.1px] text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          Choose your loan amount
        </h1>

        <section
          className="payment-success-stagger mx-auto mt-6 w-full max-w-[320px] overflow-hidden rounded-2xl border border-[#e8e8e8] bg-white"
          style={{ animationDelay: `${STAGGER_CARD_MS}ms` }}
          aria-label="Loan and down payment"
        >
          <div className="border-b border-[#e8e8e8] bg-[#f5f5f5] px-[15px] py-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs leading-[18px] text-[#4b4b4b]">Banking partner</p>
              <div className="flex shrink-0 items-center gap-2">
                <span className="relative h-5 w-5 shrink-0">
                  <Image
                    src={bank.logoSrc}
                    alt=""
                    fill
                    className="object-contain"
                    unoptimized
                    sizes="20px"
                  />
                </span>
                <p className="text-xs font-medium leading-[18px] text-[#121212]">{bank.name}</p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs leading-[18px] text-[#4b4b4b]">Interest rate</p>
              <p className="text-right text-xs font-medium leading-[18px] text-[#121212]">{bank.rate}</p>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="text-xs leading-[18px] text-[#4b4b4b]">Tenure</p>
              <p className="text-right text-xs font-medium leading-[18px] text-[#121212]">
                {DEFAULT_TENURE_MONTHS} months
              </p>
            </div>
          </div>

          <div className="px-[15px] pb-0 pt-5">
            <p className="text-base font-medium leading-6 text-[#121212]">Select your down payment amount</p>

            <div className="mt-4 flex h-10 w-[109px] max-w-full items-center rounded-lg border border-[#e8e8e8] bg-white px-[11px]">
              <span className="text-base font-semibold leading-[22px] text-[#121212]">
                {formatInr(downPayment)}
              </span>
            </div>

            <div className="mt-6">
              <label className="block" htmlFor="down-payment-range">
                <input
                  id="down-payment-range"
                  type="range"
                  className="choose-loan-down-range h-2 w-full cursor-pointer rounded-full"
                  min={MIN_DOWN_PAYMENT_INR}
                  max={ON_ROAD_PRICE_INR}
                  step={SLIDER_STEP}
                  value={downPayment}
                  onChange={onDownRangeChange}
                  style={{
                    background: `linear-gradient(to right, #121212 0%, #121212 ${fillPct}%, #e7e7e7 ${fillPct}%, #e7e7e7 100%)`,
                  }}
                />
                <div className="mt-2 flex justify-between text-xs leading-[18px] text-[#4b4b4b]">
                  <span>{formatInrLakhLabel(MIN_DOWN_PAYMENT_INR)}</span>
                  <span className="text-right">{formatInrLakhLabel(ON_ROAD_PRICE_INR)}</span>
                </div>
              </label>
            </div>
          </div>

          <div className="mt-6 border-t border-[#e3f0e5] bg-gradient-to-b from-white to-[#e7ffee]">
            <div className="flex gap-4 px-[15px] pb-3 pt-4">
              <div
                className="relative flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#e4f6e7]"
                aria-hidden
              >
                <Image
                  src={PAYMENT_CHOOSE_ASSETS.bank}
                  alt=""
                  width={24}
                  height={24}
                  className="object-contain"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs leading-[18px] text-[#121212]">Your loan amount</p>
                <p className="mt-1 text-lg font-semibold leading-6 text-[#121212]">{formatInr(loanAmount)}</p>
              </div>
            </div>
            <div className="flex h-8 items-center justify-between bg-[#e4f5e9] px-4 text-xs leading-[18px] text-[#121212]">
              <span className="font-normal">Your on-road price</span>
              <span className="font-medium">{formatInr(ON_ROAD_PRICE_INR)}</span>
            </div>
          </div>
        </section>

        <div
          className="payment-success-stagger mx-auto mt-6 flex w-full max-w-[320px] items-center gap-3 rounded-2xl border border-[#ffe380] bg-[#fff7e5] p-3"
          style={{ animationDelay: `${STAGGER_WARNING_MS}ms` }}
          role="status"
        >
          <DownPaymentNoticeIcon className="h-6 w-6 shrink-0" />
          <p className="min-w-0 flex-1 text-xs leading-[18px] text-[#d16900]">
            Pay your down payment by <span className="font-semibold">30 Apr</span> to keep your booking. You can pay
            your down payment in one full or in parts.
          </p>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)]">
        <div className="mx-auto w-full max-w-[360px] bg-white px-5 py-4">
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
