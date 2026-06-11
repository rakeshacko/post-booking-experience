"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { ModifySelectionVariantCard } from "@/components/kyc/ModifySelectionVariantCard";
import { ModifySelectionVariantFilterChips } from "@/components/kyc/ModifySelectionVariantFilterChips";
import {
  getModifySelectionCarBrandById,
  MODIFY_SELECTION_CAR_BRAND_PATH,
} from "@/lib/modify-selection-car-brands-content";
import {
  getModifySelectionCarModelById,
  modifySelectionCarModelPath,
} from "@/lib/modify-selection-car-models-content";
import { modifySelectionDifferentCarVariantScreenTitle } from "@/lib/modify-selection-different-car-content";
import { modifySelectionDifferentCarColourPath } from "@/lib/modify-selection-different-car-paths";
import { writeModifySelectionDifferentCarVariantChoice } from "@/lib/modify-selection-different-car-variant-choice";
import {
  filterModifySelectionVariants,
  getModifySelectionAvailableVariantOptions,
  type ModifySelectionVariantFilters,
} from "@/lib/modify-selection-variants-content";
import {
  modifySelectionListStaggerDelay,
  MODIFY_SELECTION_STAGGER_MS,
} from "@/lib/modify-selection-stagger";

const {
  title: STAGGER_TITLE_MS,
  filters: STAGGER_FILTERS_MS,
  firstListItem: STAGGER_FIRST_VARIANT_MS,
} = MODIFY_SELECTION_STAGGER_MS;

type ModifySelectionDifferentCarVariantScreenProps = {
  brandId: string;
  modelId: string;
};

/**
 * Choose a different car — variant picker with Continue CTA (aligned with change-variant flow).
 */
export function ModifySelectionDifferentCarVariantScreen({
  brandId,
  modelId,
}: ModifySelectionDifferentCarVariantScreenProps) {
  const router = useRouter();
  const brand = useMemo(() => getModifySelectionCarBrandById(brandId), [brandId]);
  const model = useMemo(
    () => getModifySelectionCarModelById(brandId, modelId),
    [brandId, modelId],
  );
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
    if (brand == null) {
      router.replace(MODIFY_SELECTION_CAR_BRAND_PATH);
    } else if (model == null) {
      router.replace(modifySelectionCarModelPath(brandId));
    }
  }, [brand, brandId, model, router]);

  useEffect(() => {
    if (selectedVariantId == null) return;
    if (!filteredVariants.some((option) => option.id === selectedVariantId)) {
      setSelectedVariantId(null);
    }
  }, [filteredVariants, selectedVariantId]);

  const onContinue = useCallback(() => {
    if (selectedVariantId == null) return;
    writeModifySelectionDifferentCarVariantChoice(selectedVariantId);
    router.push(modifySelectionDifferentCarColourPath(brandId, modelId));
  }, [brandId, modelId, router, selectedVariantId]);

  if (brand == null || model == null) {
    return null;
  }

  const title = modifySelectionDifferentCarVariantScreenTitle(model.name);

  return (
    <div className="min-h-dvh bg-[#f1f0f5] font-sans">
      <KycTopNavHeader />

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-5 pb-[calc(7rem+env(safe-area-inset-bottom))] pt-2">
        <h1
          className="payment-success-stagger text-2xl font-semibold leading-8 tracking-tight text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          {title}
        </h1>

        <div
          className="payment-success-stagger mt-6"
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
          aria-label={title}
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
                  animationDelay: `${modifySelectionListStaggerDelay(index, STAGGER_FIRST_VARIANT_MS)}ms`,
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
