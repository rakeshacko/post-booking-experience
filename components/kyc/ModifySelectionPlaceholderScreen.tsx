"use client";

import { useRouter } from "next/navigation";

import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { BookingCarSummaryCard } from "@/components/kyc/BookingCarSummaryCard";
import { MODIFY_SELECTION_PATH, modifySelectionChoiceLabel } from "@/lib/modify-selection-content";
import { MODIFY_SELECTION_STAGGER_MS } from "@/lib/modify-selection-stagger";

/** Stagger: nav + footer CTA immediate; then title → summary card. */
const { title: STAGGER_TITLE_MS, section: STAGGER_SECTION_MS } = MODIFY_SELECTION_STAGGER_MS;

type ModifySelectionPlaceholderScreenProps = {
  choiceSlug: string;
};

/** Demo placeholder until colour / variant / car pickers are built. */
export function ModifySelectionPlaceholderScreen({ choiceSlug }: ModifySelectionPlaceholderScreenProps) {
  const router = useRouter();
  const label = modifySelectionChoiceLabel(choiceSlug) ?? "Modify your booking";

  return (
    <div className="min-h-dvh bg-[#f1f0f5] font-sans">
      <KycTopNavHeader />

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-2">
        <h1
          className="payment-success-stagger text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          {label}
        </h1>
        <div
          className="payment-success-stagger mt-4"
          style={{ animationDelay: `${STAGGER_SECTION_MS}ms` }}
        >
          <BookingCarSummaryCard variant="detailsOnly" />
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)]">
        <div className="mx-auto w-full max-w-[640px] bg-white px-5 py-4">
          <button
            type="button"
            onClick={() => router.push(MODIFY_SELECTION_PATH)}
            className="primary-cta w-full"
          >
            Back to modify options
          </button>
        </div>
      </div>
    </div>
  );
}
