"use client";

import Image from "next/image";

import type { BANK_SHEET_OPTIONS } from "@/components/payment/payment-choose-assets";
import { BOOKING_CONFIRMED_ASSETS } from "@/components/kyc/kyc-booking-confirmed-assets";

type BankOption = (typeof BANK_SHEET_OPTIONS)[number];

type LoanApplicationBankSummaryCardProps = {
  bank: BankOption;
};

/** Figma 2540:38701 — grey bank + rate card (96px). */
export function LoanApplicationBankSummaryCard({ bank }: LoanApplicationBankSummaryCardProps) {
  return (
    <div className="flex min-h-[96px] flex-col justify-between rounded-xl bg-[#f5f5f5] px-4 py-4">
      <div className="flex items-center gap-1">
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
        <span className="text-xs font-medium leading-[18px] text-[#121212]">{bank.name}</span>
        <span className="relative h-4 w-4 shrink-0" aria-hidden>
          <Image
            src={BOOKING_CONFIRMED_ASSETS.dotSeparator}
            alt=""
            fill
            className="object-contain"
            unoptimized
            sizes="16px"
          />
        </span>
        <span className="text-xs font-medium leading-[18px] text-[#121212]">From {bank.rate}</span>
      </div>
      <p className="text-xs font-normal leading-[18px] text-[#4b4b4b]">
        The final rate of interest will be decided by the bank based on your cibil score
      </p>
    </div>
  );
}
