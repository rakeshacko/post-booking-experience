"use client";

import { HeroLabelValueSummaryCard } from "@/components/ui/HeroLabelValueSummaryCard";

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
    <HeroLabelValueSummaryCard
      ariaLabel="Sanctioned amount summary"
      label="Sanctioned amount"
      value={formatInr(sanctionedAmountInr)}
      description={
        <>
          This is the maximum amount {bankName} has approved. You can choose any loan amount within
          this limit.
        </>
      }
    />
  );
}
