"use client";

import { useState } from "react";
import { ChevronUp } from "lucide-react";

import {
  formatModifySelectionInr,
  formatModifySelectionInrSigned,
  MODIFY_SELECTION_OTHER_CHARGES_LINE_ITEMS,
  type ModifySelectionReviewPaySummary,
} from "@/lib/modify-selection-review-pay-content";

type CollapsibleRowProps = {
  label: string;
  amount: string;
  amountClassName?: string;
  open: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
};

function CollapsiblePriceRow({
  label,
  amount,
  amountClassName = "text-[#121212]",
  open,
  onToggle,
  children,
}: CollapsibleRowProps) {
  return (
    <div>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-2 text-left"
        onClick={onToggle}
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="text-sm leading-5 text-[#121212]">{label}</span>
          <ChevronUp
            className={`size-4 shrink-0 text-[#121212] transition-transform ${
              open ? "" : "rotate-180"
            }`}
            aria-hidden
            strokeWidth={2}
          />
        </span>
        <span className={`shrink-0 text-sm font-medium leading-5 ${amountClassName}`}>
          {amount}
        </span>
      </button>
      {open && children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

type ModifySelectionReviewPaymentSummaryProps = {
  summary: ModifySelectionReviewPaySummary;
};

/**
 * Price summary card — Figma 2699:9389–9425.
 */
export function ModifySelectionReviewPaymentSummary({
  summary,
}: ModifySelectionReviewPaymentSummaryProps) {
  const [otherChargesOpen, setOtherChargesOpen] = useState(false);
  const [totalDiscountOpen, setTotalDiscountOpen] = useState(false);

  return (
    <section className="mt-8" aria-labelledby="modify-selection-price-summary-heading">
      <h2
        id="modify-selection-price-summary-heading"
        className="text-base font-medium leading-6 text-[#121212]"
      >
        Price summary
      </h2>

      <div className="mt-3 overflow-hidden rounded-2xl bg-white card-elevated">
        <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm leading-5 text-[#121212]">Ex-showroom price</span>
          <span className="text-sm font-medium leading-5 text-[#121212]">
            {formatModifySelectionInr(summary.exShowroomPriceInr)}
          </span>
        </div>

        <div className="mt-4">
          <CollapsiblePriceRow
            label="Other charges"
            amount={formatModifySelectionInr(summary.otherChargesTotalInr)}
            open={otherChargesOpen}
            onToggle={() => setOtherChargesOpen((v) => !v)}
          >
            <div className="space-y-3 rounded-lg bg-[#f5f5f5] px-3 py-3">
              {MODIFY_SELECTION_OTHER_CHARGES_LINE_ITEMS.map((row) => (
                <div key={row.label} className="flex items-center justify-between gap-2">
                  <span className="text-xs leading-[18px] text-[#4b4b4b]">{row.label}</span>
                  <span className="text-xs font-medium leading-[18px] text-[#121212]">
                    {formatModifySelectionInr(row.amountInr)}
                  </span>
                </div>
              ))}
            </div>
          </CollapsiblePriceRow>
        </div>

        <hr className="my-4 border-0 border-t border-dashed border-[#e8e8e8]" />

        <CollapsiblePriceRow
          label="Total discount"
          amount={formatModifySelectionInrSigned(-summary.totalDiscountInr)}
          amountClassName="text-[#0fa457]"
          open={totalDiscountOpen}
          onToggle={() => setTotalDiscountOpen((v) => !v)}
        >
          <div className="rounded-lg bg-[#f5f5f5] px-3 py-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs leading-[18px] text-[#4b4b4b]">ACKO Drive discount</span>
              <span className="text-xs font-medium leading-[18px] text-[#0fa457]">
                {formatModifySelectionInrSigned(-summary.ackoDriveDiscountInr)}
              </span>
            </div>
          </div>
        </CollapsiblePriceRow>

        </div>

        <div className="flex items-center justify-between gap-2 bg-[#f5f5f5] px-4 py-4">
          <span className="text-base font-medium leading-6 text-[#121212]">ACKO Drive price</span>
          <span className="text-base font-semibold leading-6 text-[#121212]">
            {formatModifySelectionInr(summary.ackoDrivePriceInr)}
          </span>
        </div>
      </div>
    </section>
  );
}
