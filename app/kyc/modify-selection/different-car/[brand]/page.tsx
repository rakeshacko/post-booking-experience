import { ModifySelectionCarModelScreen } from "@/components/kyc/ModifySelectionCarModelScreen";
import { ModifySelectionFlowGuard } from "@/components/kyc/ModifySelectionFlowGuard";
import { MODIFY_SELECTION_CAR_BRAND_OPTIONS } from "@/lib/modify-selection-car-brands-content";

type PageProps = {
  params: Promise<{ brand: string }>;
};

export function generateStaticParams() {
  return MODIFY_SELECTION_CAR_BRAND_OPTIONS.map((brand) => ({
    brand: brand.id,
  }));
}

/** Model list for selected brand — Figma 2686:11003. */
export default async function ModifySelectionDifferentCarBrandPage({ params }: PageProps) {
  const { brand } = await params;
  return (
    <ModifySelectionFlowGuard>
      <ModifySelectionCarModelScreen brandId={brand} />
    </ModifySelectionFlowGuard>
  );
}
