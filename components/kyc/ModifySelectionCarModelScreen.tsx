"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

import { ModifySelectionCarModelRow } from "@/components/kyc/ModifySelectionCarModelRow";
import { KycTopNavHeader } from "@/components/kyc/KycTopNavHeader";
import {
  getModifySelectionCarBrandById,
  MODIFY_SELECTION_CAR_BRAND_PATH,
} from "@/lib/modify-selection-car-brands-content";
import {
  getModifySelectionCarModelsForBrand,
  modifySelectionCarModelPath,
  modifySelectionCarModelScreenTitle,
} from "@/lib/modify-selection-car-models-content";
import { MODIFY_SELECTION_STAGGER_MS } from "@/lib/modify-selection-stagger";

const {
  title: STAGGER_TITLE_MS,
  modelList: STAGGER_LIST_MS,
  modelStep: STAGGER_MODEL_STEP_MS,
} = MODIFY_SELECTION_STAGGER_MS;

type ModifySelectionCarModelScreenProps = {
  brandId: string;
};

/**
 * Choose a different car — model list for selected brand (Figma 2686:11003).
 */
export function ModifySelectionCarModelScreen({ brandId }: ModifySelectionCarModelScreenProps) {
  const router = useRouter();
  const brand = useMemo(() => getModifySelectionCarBrandById(brandId), [brandId]);
  const models = useMemo(() => getModifySelectionCarModelsForBrand(brandId), [brandId]);

  useEffect(() => {
    if (brand == null) {
      router.replace(MODIFY_SELECTION_CAR_BRAND_PATH);
    }
  }, [brand, router]);

  const onSelectModel = useCallback(
    (modelId: string) => {
      router.push(modifySelectionCarModelPath(brandId, modelId));
    },
    [brandId, router],
  );

  if (brand == null) {
    return null;
  }

  const title = modifySelectionCarModelScreenTitle(brand.name);

  return (
    <div className="min-h-dvh bg-[#f1f0f5] font-sans">
      <KycTopNavHeader />

      <main className="mx-auto flex w-full max-w-[640px] flex-1 flex-col px-5 pb-[env(safe-area-inset-bottom)] pt-2">
        <h1
          className="payment-success-stagger text-2xl font-semibold leading-8 tracking-[-0.1px] text-[#121212]"
          style={{ animationDelay: `${STAGGER_TITLE_MS}ms` }}
        >
          {title}
        </h1>

        <div
          className="payment-success-stagger -mx-5 mt-6 divide-y divide-[#e8e8e8]"
          style={{ animationDelay: `${STAGGER_LIST_MS}ms` }}
          role="list"
          aria-label={title}
        >
          {models.map((model, index) => (
            <div
              key={model.id}
              className="payment-success-stagger w-full"
              style={{
                animationDelay: `${STAGGER_LIST_MS + index * STAGGER_MODEL_STEP_MS}ms`,
              }}
              role="listitem"
            >
              <ModifySelectionCarModelRow
                model={model}
                onSelect={() => onSelectModel(model.id)}
              />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
