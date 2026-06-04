/**
 * Modify-selection page load sequence — nav + fixed footer CTA stay immediate;
 * main content uses `.payment-success-stagger` (see `app/globals.css`).
 */
export const MODIFY_SELECTION_STAGGER_MS = {
  title: 90,
  subtext: 120,
  section: 180,
  heading: 240,
  filters: 180,
  firstCard: 300,
  cardStep: 115,
  firstListItem: 240,
  listStep: 115,
  brandGrid: 180,
  brandStep: 40,
  modelList: 160,
  modelStep: 45,
  bookingAmount: 380,
  priceSummary: 495,
} as const;

export function modifySelectionCardStaggerDelay(
  index: number,
  firstMs: number = MODIFY_SELECTION_STAGGER_MS.firstCard,
): number {
  return firstMs + index * MODIFY_SELECTION_STAGGER_MS.cardStep;
}

export function modifySelectionListStaggerDelay(
  index: number,
  firstMs: number = MODIFY_SELECTION_STAGGER_MS.firstListItem,
): number {
  return firstMs + index * MODIFY_SELECTION_STAGGER_MS.listStep;
}
