"use client";

import Image from "next/image";
import { useCallback, type MouseEvent } from "react";

import { PAYMENT_CHOOSE_ASSETS } from "@/components/payment/payment-choose-assets";

/**
 * Stub download — replace with a real PDF URL when available.
 */
function triggerDemoMarginSlipDownload() {
  const blob = new Blob(
    ["Margin money slip (demo document)\nShare this with your bank to release funds.\n"],
    { type: "text/plain;charset=utf-8" },
  );
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "margin-money-slip-demo.txt";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Margin money slip callout — same card pattern as {@link ProformaInvoiceCard}.
 */
export function MarginMoneySlipCard() {
  const onDownload = useCallback((e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    triggerDemoMarginSlipDownload();
  }, []);

  return (
    <section
      className="w-full rounded-xl bg-white card-elevated p-3 text-left"
      aria-label="Margin money slip"
    >
      <div className="flex items-center gap-3">
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
          <p className="text-sm font-medium leading-5 text-[#121212]">Margin money slip</p>
          <p className="text-xs font-normal leading-[18px] text-[#757575]">
            Hyundai Creta 1.5 X-Line AT Diesel
          </p>
          <a
            href="#"
            onClick={onDownload}
            className="w-fit text-xs font-medium leading-[18px] text-[#1b73e8] underline-offset-2 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1b73e8]/30 focus-visible:ring-offset-2"
          >
            Download
          </a>
        </div>
      </div>
    </section>
  );
}
