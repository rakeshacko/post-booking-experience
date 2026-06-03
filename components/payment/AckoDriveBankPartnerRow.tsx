"use client";

import Image from "next/image";

import type { BANK_SHEET_OPTIONS } from "@/components/payment/payment-choose-assets";

type BankOption = (typeof BANK_SHEET_OPTIONS)[number];

type AckoDriveBankPartnerRowProps = {
  bank: BankOption;
  /** When set, shows the Change control (e.g. celebration confirmed screen). */
  onChange?: () => void;
};

/** Banking partner row — shared by ACKO Drive celebration and action screens. */
export function AckoDriveBankPartnerRow({ bank, onChange }: AckoDriveBankPartnerRowProps) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-2 text-center">
      <div className="flex items-center gap-1">
        <span className="whitespace-nowrap text-sm font-normal leading-5 text-[#4b4b4b]">
          Banking partner
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-sm bg-white">
            <Image
              src={bank.logoSrc}
              alt={bank.name}
              width={20}
              height={20}
              className="object-contain"
              unoptimized
              sizes="20px"
            />
          </span>
          <span className="whitespace-nowrap text-sm font-medium leading-5 text-[#121212]">
            {bank.brandText}
          </span>
        </span>
      </div>
      {onChange != null ? (
        <button
          type="button"
          onClick={onChange}
          className="cursor-pointer border-0 bg-transparent p-0 font-inherit whitespace-nowrap text-xs font-medium leading-5 text-[#1b73e8] underline-offset-2 transition-opacity hover:underline focus-visible:outline focus-visible:underline"
        >
          Change
        </button>
      ) : null}
    </div>
  );
}
