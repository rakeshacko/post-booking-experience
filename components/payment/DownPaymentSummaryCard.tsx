"use client";

export type DownPaymentSummaryCardProps = {
  /** When `full_payment`, row labels match the full-payment journey. */
  variant?: "down_payment" | "full_payment";
  /** Total down payment commitment (e.g. ₹3,63,780). */
  downPaymentTotalInr: number;
  /** Already paid across instalments so far (e.g. ₹1,00,000). */
  amountPaidInr: number;
  /** Remaining balance to be paid (e.g. ₹2,63,780). */
  remainingAmountInr: number;
};

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

/**
 * Down-payment progress summary shown on the “pay remaining down payment” screen.
 * Mirrors Figma node 2154:7510 — total / paid / dashed divider / remaining (emphasised).
 */
export function DownPaymentSummaryCard({
  variant = "down_payment",
  downPaymentTotalInr,
  amountPaidInr,
  remainingAmountInr,
}: DownPaymentSummaryCardProps) {
  const totalLabel =
    variant === "full_payment" ? "Amount for your new car" : "Down payment amount";
  const paidLabel = variant === "full_payment" ? "Paid so far" : "Amount paid";
  const ariaLabel =
    variant === "full_payment" ? "Full payment summary" : "Down payment summary";

  return (
    <section
      className="w-full rounded-xl border border-[#e8e8e8] bg-white px-3 py-3 text-left"
      aria-label={ariaLabel}
    >
      <dl className="m-0 flex flex-col gap-[12px]">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-xs font-normal leading-[18px] text-[#121212]">
            {totalLabel}
          </dt>
          <dd className="text-xs font-medium leading-[18px] text-[#121212]">
            {formatInr(downPaymentTotalInr)}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-xs font-normal leading-[18px] text-[#121212]">
            {paidLabel}
          </dt>
          <dd className="text-xs font-medium leading-[18px] text-[#121212]">
            {formatInr(amountPaidInr)}
          </dd>
        </div>

        <hr className="my-0 border-0 border-t border-dashed border-[#e8e8e8]" />

        <div className="flex items-center justify-between gap-3">
          <dt className="text-sm font-normal leading-5 text-[#121212]">
            Remaining amount
          </dt>
          <dd className="text-sm font-semibold leading-5 text-[#121212]">
            {formatInr(remainingAmountInr)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
