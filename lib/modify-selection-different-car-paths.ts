export function modifySelectionDifferentCarModelPath(brandId: string, modelId: string): string {
  return `/kyc/modify-selection/different-car/${brandId}/${modelId}`;
}

export function modifySelectionDifferentCarColourPath(
  brandId: string,
  modelId: string,
): string {
  return `/kyc/modify-selection/different-car/${brandId}/${modelId}/colour`;
}

export function modifySelectionDifferentCarConfirmPath(
  brandId: string,
  modelId: string,
): string {
  return `/kyc/modify-selection/different-car/${brandId}/${modelId}/confirm`;
}
