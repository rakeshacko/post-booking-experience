"use client";

import Image from "next/image";
import { useState } from "react";

import { publicAssetPath } from "@/lib/public-asset-path";

type EmploymentTab = "salaried" | "self_employed";

/** [Figma — Keep these documents handy](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=1951-13375) */
const SALARIED_DOCUMENTS = [
  "Aadhar Card",
  "PAN Card",
  "Last 3 months salary slip",
  "Last 6 months bank statement",
  "Form 16 of last 2 financial years",
  "Present Address Proof",
  "Passport size photograph",
] as const;

const SELF_EMPLOYED_DOCUMENTS = [
  "Aadhar Card",
  "PAN Card",
  "ITR of last 2 financial years",
  "Last 6 months bank statement",
  "Business / GST registration proof",
  "Present Address Proof",
  "Passport size photograph",
] as const;

/** `assets/Document.svg` — served from `public/assets` for static URL. */
const DOCUMENT_ICON = publicAssetPath("Document.svg");

function DocumentRow({ label }: { label: string }) {
  return (
    <li className="flex w-full items-center gap-2">
      <span className="relative h-4 w-4 shrink-0" aria-hidden>
        <Image
          src={DOCUMENT_ICON}
          alt=""
          width={16}
          height={16}
          className="h-4 w-4 object-contain"
          unoptimized
          sizes="16px"
        />
      </span>
      <span className="min-w-0 flex-1 text-left text-xs font-normal leading-[18px] text-[#121212]">{label}</span>
    </li>
  );
}

/**
 * “Keep these documents handy” card — tabs + document list per employment type.
 * Matches documents card in [Figma 1952:6652](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=1952-6652).
 */
export function FinanceWhatsNextPaymentProcess() {
  const [tab, setTab] = useState<EmploymentTab>("salaried");
  const items = tab === "salaried" ? SALARIED_DOCUMENTS : SELF_EMPLOYED_DOCUMENTS;

  return (
    <div className="mx-auto w-full max-w-[320px] overflow-hidden rounded-[16px] border border-solid border-[#e8e8e8] bg-white">
      <h2
        id="finance-documents-heading"
        className="mx-auto max-w-[288px] px-4 pt-[15px] text-center text-base font-medium leading-[22px] tracking-normal text-[#121212]"
      >
        Keep these documents handy
      </h2>

      <div
        className="mt-3 flex w-full border-b border-solid border-[#e8e8e8]"
        role="tablist"
        aria-label="Employment type"
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "salaried"}
          aria-controls="finance-documents-panel"
          id="finance-tab-salaried"
          onClick={() => setTab("salaried")}
          className={`-mb-px flex h-10 flex-1 items-center justify-center border-b-2 px-4 text-center text-xs leading-[18px] transition-colors ${
            tab === "salaried"
              ? "border-[#121212] font-medium text-[#121212]"
              : "border-transparent font-normal text-[#757575]"
          }`}
        >
          Salaried
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "self_employed"}
          aria-controls="finance-documents-panel"
          id="finance-tab-self-employed"
          onClick={() => setTab("self_employed")}
          className={`-mb-px flex h-10 flex-1 items-center justify-center border-b-2 px-4 text-center text-xs leading-[18px] transition-colors ${
            tab === "self_employed"
              ? "border-[#121212] font-medium text-[#121212]"
              : "border-transparent font-normal text-[#757575]"
          }`}
        >
          Self Employed
        </button>
      </div>

      <ul
        id="finance-documents-panel"
        role="tabpanel"
        aria-labelledby={tab === "salaried" ? "finance-tab-salaried" : "finance-tab-self-employed"}
        className="flex list-none flex-col gap-4 px-[15px] pb-4 pt-[21px]"
      >
        {items.map((line) => (
          <DocumentRow key={line} label={line} />
        ))}
      </ul>
    </div>
  );
}
