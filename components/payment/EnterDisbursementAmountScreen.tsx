"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState, type ChangeEvent } from "react";

import moneyIcon from "@/assets/money.svg";
import { GetHelpPillButton } from "@/components/kyc/GetHelpPillButton";
import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import {
  FULL_PAYMENT_INSURANCE_INR,
  MIN_LOAN_INR,
  ON_ROAD_PRICE_INR,
  SELF_FINANCE_LOAN_DEFAULT_INR,
  SLIDER_STEP,
} from "@/components/payment/loan-amount-demo-constants";
import { BOOKING_LOCK_AMOUNT_INR } from "@/lib/paymentUrls";
import { formatInrAmountDigits, parseInrAmountInput } from "@/lib/loan-emi";

/** Carried on `/payment/pay-down-payment` → `/payment` so the chain matches ACKO finance `?bank=` wiring. */
const SELF_FINANCE_BANK_QUERY = "self_finance";

const CAR_DOWN_PAYMENT_DUE_LABEL = "24 Apr 2026";

const STAGGER_TITLE_MS = 90;
const STAGGER_SUBTEXT_MS = 120;
const STAGGER_AMOUNT_MS = 220;
const STAGGER_SLIDER_MS = 320;
const STAGGER_SUMMARY_MS = 440;

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatInrLakhLabel(amount: number) {
  const lakhs = amount / 100_000;
  const n = lakhs % 1 === 0 ? lakhs : lakhs.toFixed(1);
  return `₹${n} lakh`;
}

function clampDisbursementLoan(value: number) {
  const stepped = Math.round(value / SLIDER_STEP) * SLIDER_STEP;
  return Math.min(ON_ROAD_PRICE_INR, Math.max(MIN_LOAN_INR, stepped));
}

/**
 * Self finance — declare bank disbursement / loan amount (Figma 2616:72152).
 * Replaces {@link DisbursementAmountCollectionBottomSheet} on the action-step CTA.
 */
export function EnterDisbursementAmountScreen() {
  const router = useRouter();
  const [loanAmount, setLoanAmount] = useState(() =>
    clampDisbursementLoan(SELF_FINANCE_LOAN_DEFAULT_INR),
  );
  const [loanAmountInput, setLoanAmountInput] = useState(() =>
    formatInrAmountDigits(clampDisbursementLoan(SELF_FINANCE_LOAN_DEFAULT_INR)),
  );

  const applyLoanAmount = useCallback((amount: number) => {
    const clamped = clampDisbursementLoan(amount);
    setLoanAmount(clamped);
    setLoanAmountInput(formatInrAmountDigits(clamped));
  }, []);

  const totalDownPaymentInr = ON_ROAD_PRICE_INR - loanAmount - BOOKING_LOCK_AMOUNT_INR;
  const carDownPaymentPortionInr = Math.max(0, totalDownPaymentInr - FULL_PAYMENT_INSURANCE_INR);

  const sliderSpan = ON_ROAD_PRICE_INR - MIN_LOAN_INR;
  const fillPct = sliderSpan > 0 ? ((loanAmount - MIN_LOAN_INR) / sliderSpan) * 100 : 0;

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
      setLoanAmount(clampDisbursementLoan(capped));
    }
  }, []);

  const onLoanAmountBlur = useCallback(() => {
    const parsed = parseInrAmountInput(loanAmountInput);
    if (loanAmountInput === "" || parsed < MIN_LOAN_INR) {
      applyLoanAmount(parsed > 0 ? parsed : SELF_FINANCE_LOAN_DEFAULT_INR);
      return;
    }
    applyLoanAmount(parsed);
  }, [applyLoanAmount, loanAmountInput]);

  const navigateToPayDownPayment = useCallback(() => {
    const q = new URLSearchParams();
    q.set("bank", SELF_FINANCE_BANK_QUERY);
    q.set("loan_amount", String(loanAmount));
    q.set("down_payment", String(totalDownPaymentInr));
    router.push(`/payment/pay-down-payment?${q.toString()}`);
  }, [loanAmount, router, totalDownPaymentInr]);

  useEffect(() => {
    router.prefetch("/payment/pay-down-payment");
  }, [router]);

  return (
    <div className="min-h-dvh bg-white font-sans">
      <KycTopNavHeader endSlot={<GetHelpPillButton />} />

      <main className="mx-auto w-full max-w-[640px] px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-2">
        <h1
          id="enter-disbursement-amount-title"
          className="payment-success-stagger text-2xl font-semibold leading-8 tracking-[-0.1px] text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          How much has your bank sanctioned?
        </h1>

        <p
          className="payment-success-stagger mt-4 text-sm font-normal leading-5 text-[#4b4b4b]"
          style={{ animationDelay: `${STAGGER_SUBTEXT_MS}ms` }}
        >
          Enter the amount your bank will transfer to Advaith Hyundai. This is usually your
          sanctioned amount minus any processing fees.
        </p>

        <div
          className="payment-success-stagger mt-8"
          style={{ animationDelay: `${STAGGER_AMOUNT_MS}ms` }}
        >
          <div className="flex h-12 min-h-12 w-[174px] max-w-full shrink-0 items-center rounded-lg border border-[#e8e8e8] bg-white px-4">
            <label htmlFor="self-finance-loan-amount-input" className="sr-only">
              Loan amount in rupees
            </label>
            <span
              className="shrink-0 text-base font-medium leading-6 text-[#040222]"
              aria-hidden
            >
              ₹{loanAmountInput.length > 0 ? "\u00a0" : ""}
            </span>
            <input
              id="self-finance-loan-amount-input"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={loanAmountInput}
              onChange={(e) => onLoanAmountInputChange(e.target.value)}
              onBlur={onLoanAmountBlur}
              className="min-w-0 flex-1 border-0 bg-transparent p-0 text-base font-medium leading-6 text-[#040222] outline-none focus:ring-0 tabular-nums"
            />
          </div>
        </div>

        <div
          className="payment-success-stagger mt-8"
          style={{ animationDelay: `${STAGGER_SLIDER_MS}ms` }}
        >
          <label className="block" htmlFor="self-finance-loan-range">
            <input
              id="self-finance-loan-range"
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
          style={{ animationDelay: `${STAGGER_SUMMARY_MS}ms` }}
          aria-label="Down payment amount and split"
        >
          <div className="flex gap-3 px-[15px] pb-3 pt-[15px]">
            <div
              className="relative flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#e4f6e7]"
              aria-hidden
            >
              <Image
                src={moneyIcon}
                alt=""
                width={24}
                height={24}
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-normal leading-[18px] text-[#121212]">Down payment amount</p>
              <p className="mt-0.5 text-[18px] font-medium leading-7 tracking-[-0.1px] text-[#121212] tabular-nums">
                {formatInr(totalDownPaymentInr)}
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
                  <span className="font-medium text-[#121212]">
                    {formatInr(carDownPaymentPortionInr)} car down payment.
                  </span>{" "}
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
                  <span className="font-medium text-[#121212]">
                    {formatInr(FULL_PAYMENT_INSURANCE_INR)} insurance amount.
                  </span>{" "}
                  Pay after your loan is disbursed
                </p>
              </li>
            </ul>
          </div>
        </section>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)]">
        <div className="mx-auto w-full max-w-[640px] bg-white px-5 pb-5 pt-3">
          <button type="button" onClick={navigateToPayDownPayment} className="primary-cta w-full">
            Confirm loan amount
          </button>
        </div>
      </div>
    </div>
  );
}
