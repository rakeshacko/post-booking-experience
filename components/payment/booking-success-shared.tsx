import Image from "next/image";

import bookingSuccessTickLottie from "@/assets/booking-success-tick.json";
import { publicAssetPath } from "@/lib/public-asset-path";

/** Bundled Lottie for payment success tick (was remote `lottie.host`). */
export const BOOKING_SUCCESS_LOTTIE_TICK_DATA = bookingSuccessTickLottie as unknown;

/** Top hero art for down payment / documents-received success screens. */
export const BOOKING_PAYMENT_SUCCESS_HERO = publicAssetPath("acko-drive-finance-hero-gradient.svg");
