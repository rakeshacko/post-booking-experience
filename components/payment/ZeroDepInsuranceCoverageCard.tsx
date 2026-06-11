"use client";

import Image from "next/image";
import { useCallback, useState, type MouseEvent } from "react";

import ackoLogo from "@/assets/ACKO logo.svg";
import { InsuranceCoverageBottomSheet } from "@/components/payment/InsuranceCoverageBottomSheet";

const DEFAULT_COVERAGE_TITLE = "Zero depreciation plan";
const DEFAULT_DESCRIPTION =
  "Your car will be insured with ACKO\u2019s Zero Depreciation Plan.";
/** Compare-at premium shown struck through beside the payable amount. */
const STRIKETHROUGH_PREMIUM_INR = 60_000;

const COVERAGE_DETAILS_LINK_CLASS =
  "mt-2 block w-fit text-xs font-medium leading-[18px] text-[#1b73e8] underline-offset-2 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1b73e8]/30 focus-visible:ring-offset-2";

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

export type ZeroDepInsuranceCoverageCardProps = {
  /** When set, “View coverage details” navigates externally instead of opening the sheet. */
  coverageDetailsHref?: string;
  /** Coverage plan name shown above the description. */
  coverageTitle?: string;
  /** Body copy under the plan name. */
  description?: string;
  /** When set, shows the insurance premium amount below the description. */
  premiumAmountInr?: number;
  /** Compact value line under the premium (e.g. IDV + add-on count). */
  includesLine?: string;
};

/**
 * Insurance coverage callout — matches Figma node 2158:10807 (Paragraph/X Small + hyperlink).
 */
export function ZeroDepInsuranceCoverageCard({
  coverageDetailsHref,
  coverageTitle = DEFAULT_COVERAGE_TITLE,
  description,
  premiumAmountInr,
  includesLine,
}: ZeroDepInsuranceCoverageCardProps) {
  const bodyCopy = description ?? DEFAULT_DESCRIPTION;
  const [coverageSheetOpen, setCoverageSheetOpen] = useState(false);

  const openCoverageSheet = useCallback(() => {
    setCoverageSheetOpen(true);
  }, []);

  const onExternalLinkClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (!coverageDetailsHref) e.preventDefault();
    },
    [coverageDetailsHref],
  );

  const coverageDetailsLinkClass =
    premiumAmountInr != null ? COVERAGE_DETAILS_LINK_CLASS : `${COVERAGE_DETAILS_LINK_CLASS} mt-1`;

  const coverageDetailsControl =
    coverageDetailsHref != null && coverageDetailsHref !== "" ? (
      <a href={coverageDetailsHref} onClick={onExternalLinkClick} className={coverageDetailsLinkClass}>
        View coverage details
      </a>
    ) : (
      <button type="button" onClick={openCoverageSheet} className={coverageDetailsLinkClass}>
        View coverage details
      </button>
    );

  return (
    <>
      <section
        className="w-full rounded-xl bg-white card-elevated p-3 text-left"
        aria-label="Car insurance coverage"
      >
        <div className="flex items-start gap-3">
          <div
            className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f5f5f5]"
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
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-sm font-semibold leading-5 text-[#121212]">
                    {formatInr(premiumAmountInr)}
                  </p>
                  <p className="text-sm font-normal leading-5 text-[#757575] line-through">
                    {formatInr(STRIKETHROUGH_PREMIUM_INR)}
                  </p>
                </div>
                {includesLine ? (
                  <p className="mt-1 text-xs leading-[18px] text-[#4b4b4b]">{includesLine}</p>
                ) : null}
                {coverageDetailsControl}
              </>
            ) : (
              <>
                <p className="text-xs font-normal leading-[18px] text-[#121212]">{bodyCopy}</p>
                {coverageDetailsControl}
              </>
            )}
          </div>
        </div>
      </section>

      <InsuranceCoverageBottomSheet
        open={coverageSheetOpen}
        onClose={() => setCoverageSheetOpen(false)}
      />
    </>
  );
}
