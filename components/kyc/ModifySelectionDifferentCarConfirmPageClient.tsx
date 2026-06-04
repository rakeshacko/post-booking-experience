"use client";

import { ModifySelectionReviewPayScreen } from "@/components/kyc/ModifySelectionReviewPayScreen";

type ModifySelectionDifferentCarConfirmPageClientProps = {
  brandId: string;
  modelId: string;
};

export function ModifySelectionDifferentCarConfirmPageClient({
  brandId,
  modelId,
}: ModifySelectionDifferentCarConfirmPageClientProps) {
  return (
    <ModifySelectionReviewPayScreen
      flow="different-car"
      brandId={brandId}
      modelId={modelId}
    />
  );
}
