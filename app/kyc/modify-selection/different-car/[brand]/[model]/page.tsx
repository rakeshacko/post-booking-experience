import { ModifySelectionDifferentCarVariantScreen } from "@/components/kyc/ModifySelectionDifferentCarVariantScreen";
import { ModifySelectionFlowGuard } from "@/components/kyc/ModifySelectionFlowGuard";
import { getModifySelectionCarModelStaticParams } from "@/lib/modify-selection-car-models-content";

type PageProps = {
  params: Promise<{ brand: string; model: string }>;
};

export function generateStaticParams() {
  return getModifySelectionCarModelStaticParams();
}

/** Variant selection after model pick. */
export default async function ModifySelectionDifferentCarModelPage({ params }: PageProps) {
  const { brand, model } = await params;
  return (
    <ModifySelectionFlowGuard>
      <ModifySelectionDifferentCarVariantScreen brandId={brand} modelId={model} />
    </ModifySelectionFlowGuard>
  );
}
