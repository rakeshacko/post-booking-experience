"use client";

import Image from "next/image";

import { KYC_ASSETS } from "@/components/kyc/kyc-assets";

/** Nav “Get help” pill — aligned with `/kyc` (KycPendingScreen) and booking-processing shell. */
export function GetHelpPillButton() {
  return (
    <button
      type="button"
      className="flex h-8 shrink-0 items-center gap-2 rounded-[32px] border border-[#e8e8e8] bg-white pl-0.5 pr-3 text-[#121212] transition-colors hover:bg-[#fafafa] focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/20 focus-visible:ring-offset-2"
    >
      <span className="relative h-7 w-9 shrink-0 overflow-hidden rounded-[32px]" aria-hidden>
        <Image
          src={KYC_ASSETS.avatarSmall}
          alt=""
          fill
          className="object-cover"
          unoptimized
          sizes="36px"
        />
      </span>
      <span className="text-xs font-medium leading-[18px]">Get help</span>
    </button>
  );
}
