"use client";

import Image from "next/image";

import { publicAssetPath } from "@/lib/public-asset-path";

/** Served from `public/assets/Info.svg` (synced from repo `assets/Info.svg`). */
const INFO_ICON_SRC = publicAssetPath("Info.svg");

/**
 * RTO registration status — same chrome as `ZeroDepInsuranceCoverageCard` (grey tile + 24px icon + body copy).
 */
export function RtoRegistrationStatusCard() {
  return (
    <section
      className="w-full rounded-xl border border-[#e8e8e8] bg-white pl-[12px] pr-3 pb-3 pt-3 text-left"
      aria-label="RTO registration status"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f5f5f5]"
          aria-hidden
        >
          <Image
            src={INFO_ICON_SRC}
            alt=""
            width={24}
            height={24}
            className="size-6 object-contain"
            unoptimized
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-normal leading-[20px] text-[rgba(18,18,18,1)]">
            You&apos;ll get your car number once registration is complete.
          </p>
        </div>
      </div>
    </section>
  );
}
