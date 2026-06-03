"use client";

import Image from "next/image";
import { useState } from "react";

import infoIcon from "@/assets/Info.svg";

import { FinanceWhatsNextPaymentProcess } from "@/components/payment/FinanceWhatsNextPaymentProcess";
import { LoanDocumentsBottomSheet } from "@/components/payment/LoanDocumentsBottomSheet";

/** Info-box copy + “see documents” link that opens the loan document checklist sheet. */
export function AckoDriveLoanDocumentsHint() {
  const [documentsOpen, setDocumentsOpen] = useState(false);

  return (
    <>
      <div
        className="flex w-full items-center gap-3 rounded-2xl border border-[#E8E8E8] bg-white px-3 py-3 text-left"
        role="region"
        aria-label="Loan documents"
      >
        <span className="relative h-5 w-5 shrink-0" aria-hidden>
          <Image
            src={infoIcon}
            alt=""
            fill
            className="object-contain"
            unoptimized
            sizes="20px"
          />
        </span>
        <div className="min-w-0 text-xs leading-[18px] text-[#121212]">
          <p>
            Keep these documents ready for your loan application.{" "}
            <button
              type="button"
              onClick={() => setDocumentsOpen(true)}
              className="inline border-0 bg-transparent p-0 font-inherit text-xs font-medium leading-[18px] text-[#1b73e8] underline-offset-2 hover:underline focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#1b73e8]/30 focus-visible:ring-offset-2"
            >
              See document checklist
            </button>
          </p>
        </div>
      </div>
      <LoanDocumentsBottomSheet open={documentsOpen} onClose={() => setDocumentsOpen(false)}>
        <FinanceWhatsNextPaymentProcess />
      </LoanDocumentsBottomSheet>
    </>
  );
}
