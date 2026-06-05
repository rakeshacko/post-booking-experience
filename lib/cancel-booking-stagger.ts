/**
 * Cancel-booking confirmation page load sequence — nav stays immediate;
 * main content uses `.payment-success-stagger` (see `app/globals.css`).
 */
export const CANCEL_BOOKING_STAGGER_MS = {
  overline: 90,
  headline: 120,
  carCard: 180,
  modifyPrompt: 300,
  modifyCta: 360,
  stillCancelPrompt: 420,
  refundCard: 480,
  confirmCta: 540,
} as const;
