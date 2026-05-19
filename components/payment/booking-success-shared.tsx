import Image from "next/image";

import hyundaiCretaThumb from "@/assets/Hyundai Creta.png";

/** Remote Lottie JSON for booking payment success tick. */
export const BOOKING_SUCCESS_LOTTIE_TICK_URL =
  "https://lottie.host/2487840b-b4dd-4475-a409-663cd2b9403b/C1cWv7yapl.json";

/** Same top hero art as down payment success / booking confirmation. */
export const BOOKING_PAYMENT_SUCCESS_HERO = "/assets/acko-drive-finance-hero-gradient.svg";

export const BOOKING_PAYMENT_SUCCESS_NEXT_PATH = "/payment/booking-success/next";

/** Playback speed for the tick Lottie (under 1 = slower). */
export const BOOKING_SUCCESS_LOTTIE_PLAYBACK_SPEED = 0.95;

/** If Lottie JSON fails to load, reveal headline after static ✓ has been visible this long. */
export const BOOKING_SUCCESS_FALLBACK_HEADLINE_REVEAL_MS = 500;

/** After headline + subtext finish revealing, wait this long before showing the car card. */
export const BOOKING_SUCCESS_REVEAL_CAR_AFTER_HEADLINE_MS = 300;

/** After car card shows, wait this long before auto-advancing to the next route. */
export const BOOKING_SUCCESS_AUTO_ADVANCE_MS = 3000;

/** Fallback: navigate to next route after this duration from mount (Lottie never completes). */
export const BOOKING_SUCCESS_MAX_WAIT_BEFORE_ADVANCE_MS = 10000;

/** [Figma 1880:6382](https://www.figma.com/design/nW5SWmJdxxsCEDlqBN7C0L/Post-booking-experience?node-id=1880-6341) */
export const BOOKING_SUCCESS_RM_INTRO_COPY =
  "Shivi is your personal relationship manager, ready to assist you with any questions or support you need.";

export const BOOKING_SUCCESS_RM_WORD_DELAY_MS = 125;

export const BOOKING_SUCCESS_WORD_OPACITY_DURATION_CLASS = "duration-[320ms]";

export type PaymentSuccessCelebrationProps = {
  /** Secondary line under “Payment successful”. */
  subline: string;
  /** Shown after “Up next:” in the amber strip (page 2). */
  upNextDetail: string;
  /** Primary bottom button label (page 2). */
  ctaLabel: string;
  /** Where the primary CTA navigates. */
  ctaHref: string;
};

/** Defaults for `/payment/booking-success/next` (keep in sync with phase 1 entry). */
export const BOOKING_PAYMENT_SUCCESS_PHASE2_DEFAULTS = {
  upNextDetail: " KYC verification",
  ctaLabel: "Continue",
  ctaHref: "/kyc",
} as const;

/** Car summary card — non-compact for phase 1; compact variant exists for legacy single-screen layouts. */
export function BookingSuccessCarCard({ compact = false }: { compact?: boolean }) {
  const imgWrap = compact ? "h-9 w-14" : "h-[45px] w-20";
  const imgSize = compact ? "h-9 max-h-9 w-14" : "h-[45px] w-full max-w-[80px]";
  const titleClass = compact
    ? "text-xs font-medium leading-4 text-[#121212]"
    : "text-sm font-medium leading-5 text-[#121212]";
  const line2 = compact
    ? "mt-0 text-[10px] font-normal leading-[14px] text-[#4b4b4b]"
    : "mt-0.5 text-xs font-normal leading-[18px] text-[#4b4b4b]";
  const line3 = compact
    ? "mt-0 text-[10px] font-normal leading-[14px] text-[#4b4b4b]"
    : "mt-0.5 text-xs font-normal leading-[18px] text-[#4b4b4b]";

  return (
    <div
      className={
        compact
          ? "mt-2 flex w-full max-w-[320px] items-center gap-2 rounded-xl border border-[#e8e8e8] bg-white px-2.5 py-2"
          : "payment-success-stagger flex min-h-[84px] w-full items-center gap-3 rounded-2xl border border-[#e8e8e8] bg-white px-4 py-3"
      }
    >
      <div className={`relative flex shrink-0 items-center justify-center overflow-hidden ${imgWrap}`}>
        <Image
          src={hyundaiCretaThumb}
          alt=""
          width={80}
          height={45}
          className={`${imgSize} object-contain object-center`}
          sizes="80px"
          priority
        />
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className={titleClass}>Hyundai Creta</p>
        <p className={line2}>1.5 X-Line AT Diesel</p>
        <p className={line3}>Starry Night</p>
      </div>
    </div>
  );
}
