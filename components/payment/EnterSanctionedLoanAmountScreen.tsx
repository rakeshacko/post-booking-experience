"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import chevronRightIcon from "@/assets/Chevron_right.svg";
import editIcon from "@/assets/Edit.svg";
import tickIcon from "@/assets/tick.svg";

import { GetHelpPillButton } from "@/components/kyc/GetHelpPillButton";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import {
  ACKO_DRIVE_DISCOUNT_INR,
  MIN_DOWN_PAYMENT_INR,
  ON_ROAD_LIST_PRICE_INR,
  ON_ROAD_PRICE_INR,
  SLIDER_STEP,
} from "@/components/payment/loan-amount-demo-constants";
import { DisbursementAmountCollectionBottomSheet } from "@/components/payment/DisbursementAmountCollectionBottomSheet";
import { BOOKING_LOCK_AMOUNT_INR } from "@/lib/paymentUrls";

/** Carried on `/payment/pay-down-payment` → `/payment` so the chain matches ACKO finance `?bank=` wiring. */
const SELF_FINANCE_BANK_QUERY = "self_finance";

const STAGGER_TITLE_MS = 90;
const STAGGER_CARD_MS = 180;
const STAGGER_INFO_MS = 300;

/** Insurance portion of down payment — Figma 2331:10371. */
const DOWN_PAYMENT_INSURANCE_INR = 37_000;
/** Due date copy for car down payment line — same frame. */
const CAR_DOWN_PAYMENT_DUE_LABEL = "24 Apr 2026";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatInrSignedNegative(amount: number) {
  const abs = Math.abs(amount);
  const formatted = formatInr(abs);
  return amount < 0 ? `-${formatted}` : formatted;
}

const MAX_LOAN_INR = ON_ROAD_PRICE_INR - MIN_DOWN_PAYMENT_INR;

function clampLoanAmount(value: number) {
  const stepped = Math.round(value / SLIDER_STEP) * SLIDER_STEP;
  return Math.min(MAX_LOAN_INR, Math.max(0, stepped));
}

/**
 * Down payment details — Figma [2331:10371](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=2331-10371).
 * Loan disbursement edit uses {@link DisbursementAmountCollectionBottomSheet}; icons from `assets/`.
 */
export function EnterSanctionedLoanAmountScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loanAmount, setLoanAmount] = useState(() =>
    clampLoanAmount(ON_ROAD_PRICE_INR - 300_000),
  );
  const [disbursementEditOpen, setDisbursementEditOpen] = useState(false);
  const [carPriceExpanded, setCarPriceExpanded] = useState(true);

  /** Payable after booking + loan (Figma “Down payment amount”). */
  const totalDownPaymentInr = ON_ROAD_PRICE_INR - loanAmount - BOOKING_LOCK_AMOUNT_INR;
  const carDownPaymentPortionInr = Math.max(0, totalDownPaymentInr - DOWN_PAYMENT_INSURANCE_INR);

  const navigateToPayment = useCallback(() => {
    const q = new URLSearchParams();
    q.set("bank", SELF_FINANCE_BANK_QUERY);
    q.set("loan_amount", String(loanAmount));
    q.set("down_payment", String(totalDownPaymentInr));
    router.push(`/payment/pay-down-payment?${q.toString()}`);
  }, [router, loanAmount, totalDownPaymentInr]);

  useEffect(() => {
    router.prefetch("/payment/pay-down-payment");
    router.prefetch("/payment");
  }, [router]);

  const disbursementPrefill = searchParams.get("disbursement_inr");

  useEffect(() => {
    if (!disbursementPrefill) return;
    const n = Number(disbursementPrefill);
    if (!Number.isFinite(n) || n <= 0) return;
    setLoanAmount(clampLoanAmount(n));
  }, [disbursementPrefill]);

  return (
    <div className="flex min-h-dvh flex-col bg-white font-sans">
      <KycTopNavHeader transparent endSlot={<GetHelpPillButton />} />

      <main className="mx-auto flex min-h-0 w-full max-w-[360px] flex-1 flex-col px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-2">
        <h1
          id="enter-sanctioned-loan-title"
          className="payment-success-stagger mx-auto mt-0 w-full max-w-[320px] text-[24px] font-semibold leading-[32px] tracking-[-0.1px] text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          Your down payment details
        </h1>

        <div
          className="payment-success-stagger mx-auto mt-6 w-full max-w-[320px] overflow-hidden rounded-[16px] border border-[#e8e8e8]"
          style={{ animationDelay: `${STAGGER_CARD_MS}ms` }}
        >
          <div className="bg-white px-4 pb-4 pt-4">
            <button
              type="button"
              onClick={() => setCarPriceExpanded((v) => !v)}
              className="flex w-full items-start justify-between gap-2 text-left"
              aria-expanded={carPriceExpanded}
            >
              <span className="inline-flex shrink-0 items-center gap-2">
                <span className="w-fit whitespace-nowrap text-sm font-normal leading-5 text-[#121212]">
                  ACKO Drive car price
                </span>
                <span className="relative flex size-4 shrink-0 justify-center pt-0.5" aria-hidden>
                  <Image
                    src={chevronRightIcon}
                    alt=""
                    width={16}
                    height={16}
                    className={`size-4 object-contain transition-transform duration-200 ${
                      carPriceExpanded ? "-rotate-90" : "rotate-90"
                    }`}
                    unoptimized
                  />
                </span>
              </span>
              <span className="shrink-0 text-right text-sm font-medium leading-5 text-[#121212] tabular-nums">
                {formatInr(ON_ROAD_PRICE_INR)}
              </span>
            </button>

            {carPriceExpanded ? (
              <div className="mt-2 flex h-[72px] w-full flex-col justify-between rounded-lg bg-[#f5f5f5] px-3 py-2.5 text-xs leading-[18px]">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#4b4b4b]">On-road price</span>
                  <span className="shrink-0 font-medium tabular-nums text-[#121212]">
                    {formatInr(ON_ROAD_LIST_PRICE_INR)}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[#4b4b4b]">ACKO Drive discount</span>
                  <span className="shrink-0 font-medium tabular-nums text-[#0fa457]">
                    {formatInrSignedNegative(-ACKO_DRIVE_DISCOUNT_INR)}
                  </span>
                </div>
              </div>
            ) : null}

            <div className="-mx-4 my-5 h-px bg-[#e8e8e8]" aria-hidden />

            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0 max-w-[196px] text-sm font-normal leading-5 text-[#121212]">
                Booking amount paid
              </span>
              <span className="w-20 shrink-0 text-right text-sm font-medium leading-5 text-[#121212] tabular-nums">
                {formatInr(BOOKING_LOCK_AMOUNT_INR)}
              </span>
            </div>

            <div className="-mx-4 my-5 h-px bg-[#e8e8e8]" aria-hidden />

            <div className="flex items-start justify-between gap-3">
              <span
                id="sanctioned-loan-amount-label"
                className="min-w-0 max-w-[196px] text-sm font-normal leading-5 text-[#121212]"
              >
                Loan disbursement amount
              </span>
              <span
                className="min-w-[80px] flex-1 text-right text-sm font-medium leading-5 text-[#121212] tabular-nums"
                aria-labelledby="sanctioned-loan-amount-label"
              >
                {formatInr(loanAmount)}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setDisbursementEditOpen(true)}
              className="mt-2 inline-flex items-center gap-2 text-xs font-medium leading-[18px] text-[#1b73e8] focus-visible:rounded focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1b73e8]/25"
            >
              <span className="relative size-4 shrink-0" aria-hidden>
                <Image
                  src={editIcon}
                  alt=""
                  width={16}
                  height={16}
                  className="size-4 object-contain"
                  unoptimized
                />
              </span>
              Edit amount
            </button>
          </div>

          <div className="flex h-16 min-h-16 items-center justify-between border-x-0 border-b-0 border-t border-[#e3f0e5] bg-gradient-to-b from-white to-[#e7ffee] px-4">
            <span className="text-sm font-medium leading-5 text-[#121212]">Down payment amount</span>
            <span className="min-w-[80px] text-right text-base font-semibold leading-6 text-[#121212] tabular-nums">
              {formatInr(totalDownPaymentInr)}
            </span>
          </div>
        </div>

        <div
          className="payment-success-stagger mx-auto mt-4 min-h-[138px] w-full max-w-[320px] rounded-[16px] border border-[#ffe380] bg-[#fff7e5] px-[15px] py-3"
          style={{ animationDelay: `${STAGGER_INFO_MS}ms` }}
          role="region"
          aria-label="Down payment parts"
        >
          <p className="text-xs font-normal leading-[18px] text-[#121212]">
            Your down payment has two parts -
          </p>
          <ul className="mt-2 space-y-2">
            <li className="flex gap-2">
              <span className="relative mt-0.5 size-5 shrink-0" aria-hidden>
                <Image
                  src={tickIcon}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 object-contain"
                  unoptimized
                />
              </span>
              <p className="max-w-[260px] text-xs leading-[18px] text-[#121212]">
                Pay the car down payment of{" "}
                <span className="font-semibold">
                  {formatInr(carDownPaymentPortionInr)} by {CAR_DOWN_PAYMENT_DUE_LABEL}
                </span>{" "}
                to keep your booking active.
              </p>
            </li>
            <li className="flex gap-2">
              <span className="relative mt-0.5 size-5 shrink-0" aria-hidden>
                <Image
                  src={tickIcon}
                  alt=""
                  width={20}
                  height={20}
                  className="size-5 object-contain"
                  unoptimized
                />
              </span>
              <p className="max-w-[260px] text-xs leading-[18px] text-[#121212]">
                Pay{" "}
                <span className="font-semibold">
                  {formatInr(DOWN_PAYMENT_INSURANCE_INR)} insurance amount
                </span>{" "}
                after your bank disburses the loan.
              </p>
            </li>
          </ul>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)]">
        <div className="mx-auto w-full max-w-[360px] bg-white px-5 pb-5 pt-3">
          <button
            type="button"
            onClick={navigateToPayment}
            className="primary-cta w-full"
          >
            Confirm down payment
          </button>
        </div>
      </div>

      <DisbursementAmountCollectionBottomSheet
        open={disbursementEditOpen}
        onClose={() => setDisbursementEditOpen(false)}
        title="Update your disbursement amount"
        primaryCtaLabel="Update"
        initialDisbursementInr={loanAmount}
        onSubmitAmount={(inr) => {
          setLoanAmount(clampLoanAmount(inr));
          setDisbursementEditOpen(false);
        }}
      />

    </div>
  );
}
