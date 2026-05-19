"use client";

import Image from "next/image";
import { useCallback, type MouseEvent } from "react";

import { publicAssetPath } from "@/lib/public-asset-path";

/** Served from `public/assets/` (synced from repo `assets/Car coverage.svg`). */
const CAR_COVERAGE_SRC = publicAssetPath("Car coverage.svg");

export type ZeroDepInsuranceCoverageCardProps = {
  /** Optional href for “View coverage details” (e.g. policy doc URL). */
  coverageDetailsHref?: string;
};

/**
 * Insurance coverage callout — matches Figma node 2158:10807 (Paragraph/X Small + hyperlink).
 */
export function ZeroDepInsuranceCoverageCard({
  coverageDetailsHref,
}: ZeroDepInsuranceCoverageCardProps) {
  const onPlaceholderClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (!coverageDetailsHref) e.preventDefault();
  }, [coverageDetailsHref]);

  return (
    <section
      className="w-full rounded-xl border border-[#e8e8e8] bg-white p-3 text-left"
      aria-label="Car insurance coverage"
    >
      <div className="flex items-center gap-3">
        <div
          className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f5f5f5]"
          aria-hidden
        >
          <Image
            src={CAR_COVERAGE_SRC}
            alt=""
            width={24}
            height={24}
            className="size-6 object-contain"
            unoptimized
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-xs font-normal leading-[18px] text-[#121212]">
            Your car will be insured with ACKO&apos;s Zero Depreciation Plan.
          </p>
          <a
            href={coverageDetailsHref ?? "#"}
            onClick={onPlaceholderClick}
            className="block w-fit text-xs font-medium leading-[18px] text-[#1b73e8] underline-offset-2 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1b73e8]/30 focus-visible:ring-offset-2"
          >
            View coverage details
          </a>
        </div>
      </div>
    </section>
  );
}
