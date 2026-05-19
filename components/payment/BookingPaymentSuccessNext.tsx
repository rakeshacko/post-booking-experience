"use client";

/** Phase 2 — Shivi RM intro + fixed “Up next” footer with primary CTA (`/payment/booking-success/next`). */

import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import shiviAvatar from "@/assets/Shivi image.png";

import {
  BOOKING_SUCCESS_RM_INTRO_COPY,
  BOOKING_SUCCESS_RM_WORD_DELAY_MS,
  BOOKING_SUCCESS_WORD_OPACITY_DURATION_CLASS,
  type PaymentSuccessCelebrationProps,
} from "@/components/payment/booking-success-shared";
import { WordByWordLine } from "@/components/payment/WordByWordLine";

type Props = Pick<PaymentSuccessCelebrationProps, "upNextDetail" | "ctaLabel" | "ctaHref">;

export function BookingPaymentSuccessNext({ upNextDetail, ctaLabel, ctaHref }: Props) {
  const router = useRouter();

  return (
    <div className="relative min-h-dvh overflow-hidden bg-white font-sans">
      <div
        className="mx-auto flex w-full max-w-md flex-1 flex-col overflow-y-auto px-4 pb-[calc(112px+env(safe-area-inset-bottom))] pt-6"
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
          className="flex flex-col items-center text-center"
        >
          <div className="h-[78px] w-[78px] shrink-0 overflow-hidden rounded-xl bg-[#f5f5f5]">
            <Image
              src={shiviAvatar}
              alt=""
              width={78}
              height={78}
              className="h-full w-full object-cover"
              sizes="78px"
            />
          </div>
          <p className="mt-4 text-sm font-medium leading-5 text-[#121212]">Hi Sharath,</p>
          <WordByWordLine
            text={BOOKING_SUCCESS_RM_INTRO_COPY}
            wordDelayMs={BOOKING_SUCCESS_RM_WORD_DELAY_MS}
            className="mt-2 max-w-sm text-center text-sm font-normal leading-5 text-[#121212]"
            wordOpacityDurationClassName={BOOKING_SUCCESS_WORD_OPACITY_DURATION_CLASS}
          />
        </motion.div>
      </div>

      <div
        className="payment-success-stagger fixed bottom-0 left-0 right-0 z-10 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_6px_0_rgba(54,53,76,0.08)]"
        style={{ animationDelay: "80ms" }}
      >
        <div className="mx-auto w-full max-w-[360px]">
          <div className="flex h-8 items-center justify-center bg-[#fff7e5] px-5">
            <p className="text-center text-xs leading-[18px] text-[#121212]">
              <span className="font-medium">Up next:</span>
              <span className="font-normal">{upNextDetail}</span>
            </p>
          </div>
          <div className="flex h-20 flex-col bg-white px-5 pb-5 pt-3">
            <button
              type="button"
              onClick={() => router.push(ctaHref)}
              className="primary-cta focus-visible:outline focus-visible:ring-2 focus-visible:ring-[#3395ff] focus-visible:ring-offset-2"
            >
              {ctaLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
