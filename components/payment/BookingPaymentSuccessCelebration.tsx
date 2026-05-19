"use client";

/**
 * Booking payment success — phase 1: centered Lottie, headline, subline, car card only.
 * Replaces `/payment/booking-success` in history with `/payment/booking-success/next` after the
 * celebration (car visible + 3s), or after 10s max if animation stalls — avoids back looping to loader.
 */

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Lottie, { type LottieRefCurrentProps } from "lottie-react";
import { motion } from "framer-motion";

import {
  BOOKING_PAYMENT_SUCCESS_HERO,
  BOOKING_PAYMENT_SUCCESS_NEXT_PATH,
  BOOKING_SUCCESS_AUTO_ADVANCE_MS,
  BOOKING_SUCCESS_LOTTIE_TICK_DATA,
  BOOKING_SUCCESS_MAX_WAIT_BEFORE_ADVANCE_MS,
  BOOKING_SUCCESS_LOTTIE_PLAYBACK_SPEED,
  BOOKING_SUCCESS_REVEAL_CAR_AFTER_HEADLINE_MS,
  BookingSuccessCarCard,
  type PaymentSuccessCelebrationProps,
} from "@/components/payment/booking-success-shared";
import { SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS } from "@/components/ui/success-screen-layout";

type Props = Pick<PaymentSuccessCelebrationProps, "subline">;

export function BookingPaymentSuccessCelebration({ subline }: Props) {
  const router = useRouter();
  const [showHeadlineBlock, setShowHeadlineBlock] = useState(false);
  const [showCarCard, setShowCarCard] = useState(false);
  const headlineRevealHandledRef = useRef(false);
  const lottiePlayerRef = useRef<LottieRefCurrentProps | null>(null);
  const hasNavigatedRef = useRef(false);

  const navigateNext = useCallback(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    router.replace(BOOKING_PAYMENT_SUCCESS_NEXT_PATH);
  }, [router]);

  const revealHeadlineAfterAnimation = useCallback(() => {
    if (headlineRevealHandledRef.current) return;
    headlineRevealHandledRef.current = true;
    setShowHeadlineBlock(true);
  }, []);

  useEffect(() => {
    if (!showHeadlineBlock) return;
    const id = window.setTimeout(
      () => setShowCarCard(true),
      BOOKING_SUCCESS_REVEAL_CAR_AFTER_HEADLINE_MS,
    );
    return () => window.clearTimeout(id);
  }, [showHeadlineBlock]);

  /** 3 seconds after car card is visible → next page via replace */
  useEffect(() => {
    if (!showCarCard) return;
    const id = window.setTimeout(navigateNext, BOOKING_SUCCESS_AUTO_ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [showCarCard, navigateNext]);

  /** Never trap user if celebration never completes */
  useEffect(() => {
    const id = window.setTimeout(navigateNext, BOOKING_SUCCESS_MAX_WAIT_BEFORE_ADVANCE_MS);
    return () => window.clearTimeout(id);
  }, [navigateNext]);

  const lottieBlock = (
    <div className="relative flex h-[144px] w-[144px] shrink-0 items-center justify-center">
      {BOOKING_SUCCESS_LOTTIE_TICK_DATA ? (
        <Lottie
          lottieRef={lottiePlayerRef}
          animationData={BOOKING_SUCCESS_LOTTIE_TICK_DATA}
          loop={false}
          onComplete={revealHeadlineAfterAnimation}
          onDOMLoaded={() => {
            lottiePlayerRef.current?.setSpeed(BOOKING_SUCCESS_LOTTIE_PLAYBACK_SPEED);
          }}
          className="h-full w-full origin-center"
          aria-label="Payment successful animation"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full bg-[#22c55e] text-4xl text-white shadow-[0_0_48px_rgba(34,197,94,0.45)]"
          aria-hidden
        >
          ✓
        </div>
      )}
    </div>
  );

  const headlineRevealed = showHeadlineBlock;

  const titleBlock = (
    <motion.div
      initial={false}
      animate={{
        opacity: headlineRevealed ? 1 : 0,
        y: headlineRevealed ? 0 : 8,
      }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className={`flex w-full flex-col items-center text-center ${!showHeadlineBlock ? "pointer-events-none" : ""}`}
      aria-hidden={!showHeadlineBlock ? true : undefined}
    >
      <div
        className={`mt-2 flex w-full flex-col items-center ${SUCCESS_SCREEN_HEADLINE_SUBTEXT_GAP_CLASS}`}
      >
        <h1 className="text-[24px] font-semibold leading-7 tracking-tight text-[#1a1a1a]">
          Payment successful
        </h1>
        <p className="max-w-sm text-sm font-normal leading-5 text-[#6b7280]">{subline}</p>
      </div>
    </motion.div>
  );

  return (
    <div className="relative min-h-dvh overflow-hidden bg-white font-sans">
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[240px] w-full max-w-[640px] -translate-x-1/2"
        aria-hidden
      >
        <Image
          src={BOOKING_PAYMENT_SUCCESS_HERO}
          alt=""
          fill
          className="object-cover object-top"
          priority
          sizes="(max-width: 640px) 100vw, 640px"
          unoptimized
        />
      </div>

      <div className="relative z-10 flex min-h-dvh w-full flex-col justify-center px-4">
        <div className="mx-auto flex w-full -translate-y-10 flex-col items-center">
          {lottieBlock}
          {titleBlock}
          <motion.div
            initial={false}
            animate={{
              opacity: showCarCard ? 1 : 0,
              y: showCarCard ? 0 : 10,
            }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            className={`w-full px-0 pt-8 ${!showCarCard ? "pointer-events-none" : ""}`}
            aria-hidden={!showCarCard ? true : undefined}
          >
            <BookingSuccessCarCard compact={false} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
