import type { ReactNode } from "react";

export type HeroLabelValueSummaryCardProps = {
  label: string;
  value: ReactNode;
  description: ReactNode;
  /** Accessible name for the card region. */
  ariaLabel?: string;
};

/**
 * Hero callout — label + value row, dashed divider, body copy (Figma sanctioned-amount pattern).
 */
export function HeroLabelValueSummaryCard({
  label,
  value,
  description,
  ariaLabel = "Summary",
}: HeroLabelValueSummaryCardProps) {
  return (
    <section
      className="w-full rounded-2xl bg-white card-elevated px-3 py-3 text-left"
      aria-label={ariaLabel}
    >
      <dl className="m-0 flex items-center justify-between gap-3">
        <dt className="text-sm font-normal leading-5 text-[#4b4b4b]">{label}</dt>
        <dd className="text-base font-semibold leading-6 text-[#121212]">{value}</dd>
      </dl>

      <hr className="my-3 border-0 border-t border-dashed border-[#e8e8e8]" />

      <p className="text-xs font-normal leading-[18px] text-[#4b4b4b]">{description}</p>
    </section>
  );
}
