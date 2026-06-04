"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import { ModifySelectionCarBrandCard } from "@/components/kyc/ModifySelectionCarBrandCard";
import {
  MODIFY_SELECTION_CAR_BRAND_OPTIONS,
  MODIFY_SELECTION_CAR_BRAND_SCREEN_TITLE,
} from "@/lib/modify-selection-car-brands-content";
import { MODIFY_SELECTION_STAGGER_MS } from "@/lib/modify-selection-stagger";

const {
  title: STAGGER_TITLE_MS,
  brandGrid: STAGGER_GRID_MS,
  brandStep: STAGGER_BRAND_STEP_MS,
} = MODIFY_SELECTION_STAGGER_MS;

/**
 * Choose a different car — brand grid (Figma 2686:11633).
 */
export function ModifySelectionCarBrandScreen() {
  const router = useRouter();

  const onSelectBrand = useCallback(
    (brandId: string) => {
      router.push(`/kyc/modify-selection/different-car/${brandId}`);
    },
    [router],
  );

  return (
    <div className="min-h-dvh bg-white font-sans">
      <KycTopNavHeader />

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-5 pb-[env(safe-area-inset-bottom)] pt-2">
        <h1
          className="payment-success-stagger text-2xl font-semibold leading-8 tracking-[-0.1px] text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          {MODIFY_SELECTION_CAR_BRAND_SCREEN_TITLE}
        </h1>

        <div
          className="payment-success-stagger mt-6 grid grid-cols-3 gap-3"
          style={{ animationDelay: `${STAGGER_GRID_MS}ms` }}
          role="group"
          aria-label={MODIFY_SELECTION_CAR_BRAND_SCREEN_TITLE}
        >
          {MODIFY_SELECTION_CAR_BRAND_OPTIONS.map((brand, index) => (
            <div
              key={brand.id}
              className="payment-success-stagger w-full"
              style={{
                animationDelay: `${STAGGER_GRID_MS + index * STAGGER_BRAND_STEP_MS}ms`,
              }}
            >
              <ModifySelectionCarBrandCard
                brand={brand}
                selected={false}
                onSelect={() => onSelectBrand(brand.id)}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
