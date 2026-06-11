"use client";

import Image from "next/image";
import { useCallback, type MouseEvent } from "react";

import { PAYMENT_CHOOSE_ASSETS } from "@/components/payment/payment-choose-assets";

export type ProformaInvoiceCardProps = {
  /** Optional URL for the proforma PDF (stub uses `#` until wired). */
  downloadHref?: string;
};

/**
 * Proforma invoice callout — title, variant line, download link.
 */
export function ProformaInvoiceCard({ downloadHref }: ProformaInvoiceCardProps) {
  const onPlaceholderClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      if (!downloadHref) e.preventDefault();
    },
    [downloadHref],
  );

  return (
    <section
      className="w-full rounded-xl bg-white card-elevated p-3 text-left"
      aria-label="Proforma invoice"
    >
      <div className="flex items-start gap-3">
        <div
          className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#f5f5f5]"
          aria-hidden
        >
          <Image
            src={PAYMENT_CHOOSE_ASSETS.documentBlack}
            alt=""
            width={24}
            height={24}
            className="size-6 object-contain"
            unoptimized
          />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="text-sm font-medium leading-5 text-[#121212]">Proforma Invoice</p>
          <p className="text-xs font-normal leading-[18px] text-[#757575]">
            Hyundai Creta 1.5 X-Line AT Diesel
          </p>
          <a
            href={downloadHref ?? "#"}
            onClick={onPlaceholderClick}
            className="w-fit text-xs font-medium leading-[18px] text-[#1b73e8] underline-offset-2 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1b73e8]/30 focus-visible:ring-offset-2"
          >
            Download PDF
          </a>
        </div>
      </div>
    </section>
  );
}
