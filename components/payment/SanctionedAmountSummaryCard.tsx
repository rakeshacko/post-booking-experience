"use client";

export type SanctionedAmountSummaryCardProps = {
  /** Sanctioned loan amount in INR (whole rupees). */
  sanctionedAmountInr: number;
  /** Bank name for the explainer copy (e.g. "Bank of Baroda"). */
  bankName: string;
};

function formatInr(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.max(0, Math.round(amount)));
}

/**
 * Loan sanctioned hero — label + amount row, dashed divider, and two-line explainer.
 */
export function SanctionedAmountSummaryCard({
  sanctionedAmountInr,
  bankName,
}: SanctionedAmountSummaryCardProps) {
  return (
    <section
      className="w-full rounded-2xl border border-[#E8E8E8] bg-white px-3 py-3 text-left"
      aria-label="Sanctioned amount summary"
    >
      <dl className="m-0 flex items-center justify-between gap-3">
        <dt className="text-sm font-normal leading-5 text-[#4b4b4b]">Sanctioned amount</dt>
        <dd className="text-base font-semibold leading-6 text-[#121212]">
          {formatInr(sanctionedAmountInr)}
        </dd>
      </dl>

      <hr className="my-3 border-0 border-t border-dashed border-[#e8e8e8]" />

      <p className="text-xs font-normal leading-[18px] text-[#4b4b4b]">
        This is the maximum amount {bankName} has approved. You can choose any loan amount within
        this limit.
      </p>
    </section>
  );
}
