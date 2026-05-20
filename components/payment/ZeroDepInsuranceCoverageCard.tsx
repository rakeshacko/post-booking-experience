"use client";

import Image from "next/image";
import { useCallback, type MouseEvent } from "react";

import ackoLogo from "@/assets/ACKO logo.svg";

const DEFAULT_COVERAGE_TITLE = "Zero depreciation plan";
const DEFAULT_DESCRIPTION =
  "Your car will be insured with ACKO\u2019s Zero Depreciation Plan.";
/** Compare-at premium shown struck through beside the payable amount. */
const STRIKETHROUGH_PREMIUM_INR = 60_000;

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

export type ZeroDepInsuranceCoverageCardProps = {
  /** Optional href for “View coverage details” (e.g. policy doc URL). */
  coverageDetailsHref?: string;
  /** Coverage plan name shown above the description. */
  coverageTitle?: string;
  /** Body copy under the plan name. */
  description?: string;
  /** When set, shows the insurance premium amount below the description. */
  premiumAmountInr?: number;
};

/**
 * Insurance coverage callout — matches Figma node 2158:10807 (Paragraph/X Small + hyperlink).
 */
export function ZeroDepInsuranceCoverageCard({
  coverageDetailsHref,
  coverageTitle = DEFAULT_COVERAGE_TITLE,
  description,
  premiumAmountInr,
}: ZeroDepInsuranceCoverageCardProps) {
  const bodyCopy = description ?? DEFAULT_DESCRIPTION;

  const onPlaceholderClick = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    if (!coverageDetailsHref) e.preventDefault();
  }, [coverageDetailsHref]);

  return (
    <section
      className="w-full rounded-xl border border-[#e8e8e8] bg-white p-3 text-left"
      aria-label="Car insurance coverage"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f5f5f5]"
          aria-hidden
        >
          <Image
            src={ackoLogo}
            alt=""
            width={32}
            height={32}
            className="size-8 object-contain"
            unoptimized
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          {premiumAmountInr != null ? (
            <>
              <p className="text-sm font-medium leading-5 text-[#121212]">{coverageTitle}</p>
              <div className="mt-2 flex items-center gap-2">
                <p className="text-sm font-semibold leading-5 text-[#121212]">
                  {formatInr(premiumAmountInr)}
                </p>
                <p className="text-sm font-normal leading-5 text-[#757575] line-through">
                  {formatInr(STRIKETHROUGH_PREMIUM_INR)}
                </p>
              </div>
              <a
                href={coverageDetailsHref ?? "#"}
                onClick={onPlaceholderClick}
                className="mt-2 block w-fit text-xs font-medium leading-[18px] text-[#1b73e8] underline-offset-2 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1b73e8]/30 focus-visible:ring-offset-2"
              >
                View coverage details
              </a>
            </>
          ) : (
            <>
              <p className="text-xs font-normal leading-[18px] text-[#121212]">{bodyCopy}</p>
              <a
                href={coverageDetailsHref ?? "#"}
                onClick={onPlaceholderClick}
                className="mt-1 block w-fit text-xs font-medium leading-[18px] text-[#1b73e8] underline-offset-2 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1b73e8]/30 focus-visible:ring-offset-2"
              >
                View coverage details
              </a>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
