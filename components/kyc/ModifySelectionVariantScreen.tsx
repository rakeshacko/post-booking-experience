"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BookingCarSummaryCard } from "@/components/kyc/BookingCarSummaryCard";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { ModifySelectionVariantCard } from "@/components/kyc/ModifySelectionVariantCard";
import { ModifySelectionVariantFilterChips } from "@/components/kyc/ModifySelectionVariantFilterChips";
import { writeModifySelectionVariantChoice } from "@/lib/modify-selection-variant-choice";
import { MODIFY_SELECTION_CURRENT_SELECTION_HEADING } from "@/lib/modify-selection-content";
import {
  filterModifySelectionVariants,
  getModifySelectionAvailableVariantOptions,
  MODIFY_SELECTION_AVAILABLE_VARIANTS_HEADING,
  MODIFY_SELECTION_VARIANT_COLOUR_PATH,
  MODIFY_SELECTION_VARIANT_SCREEN_TITLE,
  type ModifySelectionVariantFilters,
} from "@/lib/modify-selection-variants-content";
import {
  modifySelectionCardStaggerDelay,
  MODIFY_SELECTION_STAGGER_MS,
} from "@/lib/modify-selection-stagger";

const {
  title: STAGGER_TITLE_MS,
  section: STAGGER_CAR_SUMMARY_MS,
  heading: STAGGER_SECTION_HEADING_MS,
  filters: STAGGER_FILTERS_MS,
  firstCard: STAGGER_FIRST_VARIANT_MS,
} = MODIFY_SELECTION_STAGGER_MS;

/**
 * Change variant — booked car summary, quick filters, variant cards (Figma 2682:9105).
 */
export function ModifySelectionVariantScreen() {
  const router = useRouter();
  const allVariants = useMemo(() => getModifySelectionAvailableVariantOptions(), []);
  const [filters, setFilters] = useState<ModifySelectionVariantFilters>({
    fuel: null,
    transmission: null,
  });
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const filteredVariants = useMemo(
    () => filterModifySelectionVariants(allVariants, filters),
    [allVariants, filters],
  );

  useEffect(() => {
    if (selectedVariantId == null) return;
    if (!filteredVariants.some((option) => option.id === selectedVariantId)) {
      setSelectedVariantId(null);
    }
  }, [filteredVariants, selectedVariantId]);

  const onContinue = useCallback(() => {
    if (selectedVariantId == null) return;
    writeModifySelectionVariantChoice(selectedVariantId);
    router.push(MODIFY_SELECTION_VARIANT_COLOUR_PATH);
  }, [router, selectedVariantId]);

  return (
    <div className="min-h-dvh bg-[#f1f0f5] font-sans">
      <KycTopNavHeader />

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-2">
        <h1
          className="payment-success-stagger text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          {MODIFY_SELECTION_VARIANT_SCREEN_TITLE}
        </h1>

        <section
          className="payment-success-stagger mb-[24px] mt-5"
          style={{ animationDelay: `${STAGGER_CAR_SUMMARY_MS}ms` }}
          aria-labelledby="modify-selection-variant-current-selection-heading"
        >
          <h2
            id="modify-selection-variant-current-selection-heading"
            className="text-sm font-medium leading-5 text-[#757575]"
          >
            {MODIFY_SELECTION_CURRENT_SELECTION_HEADING}
          </h2>
          <div className="mt-3">
            <BookingCarSummaryCard variant="detailsOnly" />
          </div>
        </section>

        <h2
          className="payment-success-stagger text-sm font-medium leading-5 text-[#757575]"
          style={{ animationDelay: `${STAGGER_SECTION_HEADING_MS}ms` }}
        >
          {MODIFY_SELECTION_AVAILABLE_VARIANTS_HEADING}
        </h2>

        <div
          className="payment-success-stagger mt-4"
          style={{ animationDelay: `${STAGGER_FILTERS_MS}ms` }}
        >
          <ModifySelectionVariantFilterChips
            filters={filters}
            onFuelChange={(fuel) => setFilters((prev) => ({ ...prev, fuel }))}
            onTransmissionChange={(transmission) =>
              setFilters((prev) => ({ ...prev, transmission }))
            }
          />
        </div>

        <div
          className="mt-4 flex flex-col gap-3"
          role="group"
          aria-label={MODIFY_SELECTION_AVAILABLE_VARIANTS_HEADING}
        >
          {filteredVariants.length === 0 ? (
            <p className="text-sm font-normal leading-5 text-[#757575]">
              No variants match these filters. Try changing or clearing a filter.
            </p>
          ) : (
            filteredVariants.map((option, index) => (
              <div
                key={option.id}
                className="payment-success-stagger w-full"
                style={{
                  animationDelay: `${modifySelectionCardStaggerDelay(index, STAGGER_FIRST_VARIANT_MS)}ms`,
                }}
              >
                <ModifySelectionVariantCard
                  option={option}
                  selected={selectedVariantId === option.id}
                  onSelect={() => setSelectedVariantId(option.id)}
                />
              </div>
            ))
          )}
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)]">
        <div className="mx-auto w-full max-w-[640px] bg-white px-5 py-4">
          <button
            type="button"
            disabled={selectedVariantId == null}
            onClick={onContinue}
            className="primary-cta w-full focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#121212]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#a0a0a0] disabled:opacity-100 disabled:hover:bg-[#a0a0a0]"
          >
            Continue
          </button>
        </div>
      </div>

    </div>
  );
}
