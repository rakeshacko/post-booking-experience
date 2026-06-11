"use client";

import { FULL_PAYMENT_INSURANCE_INR } from "@/components/payment/loan-amount-demo-constants";

export type DownPaymentAmountSummaryCardProps = {
  /** Car down payment due now in INR (total down payment minus insurance). */
  downPaymentAmountInr: number;
};

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

/**
 * Pay-down-payment hero — label + amount row (aligned with sanctioned card).
 */
export function DownPaymentAmountSummaryCard({
  downPaymentAmountInr,
}: DownPaymentAmountSummaryCardProps) {
  return (
    <section
      className="w-full rounded-2xl bg-white card-elevated px-3 py-3 text-left"
      aria-label="Car down payment summary"
    >
      <dl className="m-0 flex items-center justify-between gap-3">
        <dt className="text-sm font-normal leading-5 text-[#4b4b4b]">Car down payment</dt>
        <dd className="text-base font-semibold leading-6 text-[#121212]">
          {formatInr(downPaymentAmountInr)}
        </dd>
      </dl>

      <hr className="my-3 border-0 border-t border-dashed border-[#e8e8e8]" />

      <p className="text-xs font-normal leading-[18px] text-[#4b4b4b]">
        The insurance amount of {formatInr(FULL_PAYMENT_INSURANCE_INR)} is due much later — just
        before delivery, when the RTO registration needs it.
      </p>
    </section>
  );
}
