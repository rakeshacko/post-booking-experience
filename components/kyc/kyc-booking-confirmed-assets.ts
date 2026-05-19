import { publicAssetPath, publicAssetPathIn } from "@/lib/public-asset-path";

/**
 * Booking confirmed — self-hosted under `public/assets/kyc-booking-confirmed/`
 * (copied from Figma MCP; avoids cold CDN latency).
 */
const asset = (filename: string) => publicAssetPathIn("kyc-booking-confirmed", filename);

export const BOOKING_CONFIRMED_ASSETS = {
  cardBackdrop: publicAssetPath("Car card bg.png"),
  carCutout: asset("car-cutout.png"),
  dotSeparator: publicAssetPath("dot separator.svg"),
  /** Express delivery bolt — `express-delivery.svg` under this folder. */
  expressDelivery: asset("express-delivery.svg"),
} as const;
