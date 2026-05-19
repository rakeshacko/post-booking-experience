/**
 * Booking confirmed — self-hosted under `/public/assets/kyc-booking-confirmed/`
 * (copied from Figma MCP; avoids cold CDN latency).
 */
const asset = (filename: string) => `/assets/kyc-booking-confirmed/${encodeURIComponent(filename)}`;
/** Repo `assets/` mirror under `/public/assets/` (e.g. design `dot separator.svg`). */
const publicAsset = (filename: string) => `/assets/${encodeURIComponent(filename)}`;

export const BOOKING_CONFIRMED_ASSETS = {
  cardBackdrop: publicAsset("Car card bg.png"),
  carCutout: asset("car-cutout.png"),
  dotSeparator: publicAsset("dot separator.svg"),
  /** Express delivery bolt — `express-delivery.svg` under this folder. */
  expressDelivery: asset("express-delivery.svg"),
} as const;
